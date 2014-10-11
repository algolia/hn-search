require 'rubygems/package'
require 'zlib'

class Item < ActiveRecord::Base

  as_enum :item_type, %w{story comment poll pollopt unknown}

  validates_length_of :url, within: 0..32768, allow_nil: true, allow_blank: true
  validates_length_of :text, within: 0..32768, allow_nil: true, allow_blank: true
  validates_length_of :author, within: 0..255, allow_nil: true, allow_blank: true

  after_create :after_create_tasks

  belongs_to :parent, class_name: "Item", foreign_key: "parent_id"
  has_many :children, class_name: "Item", foreign_key: "parent_id"

  belongs_to :story, class_name: "Item", foreign_key: "story_id"
  has_many :story_comments, -> { where('item_type_cd = ?', Item.comment) }, class_name: "Item", foreign_key: "story_id"

  SHOW_HN_RX = /^show hn\b/i
  ASK_HN_RX = /^ask hn\b/i

  include AlgoliaSearch
  algoliasearch per_environment: true, auto_index: false, if: :live? do
    attribute :created_at, :title, :url, :author, :points, :story_text, :comment_text, :author, :num_comments, :story_id, :story_title, :story_url, :parent_id
    attribute :created_at_i do
      created_at.to_i
    end
    attributesToIndex ['unordered(title)', 'unordered(story_text)', 'unordered(comment_text)', 'unordered(url)', 'author', 'created_at_i']
    attributesToHighlight ['title', 'story_text', 'comment_text', 'url', 'story_url', 'author', 'story_title']
    tags do
      t = [item_type, "author_#{author}", "story_#{story_id || id}"]
      if item_type_cd == Item.story
        case title
        when SHOW_HN_RX
          t << 'show_hn'
        when ASK_HN_RX
          t << 'ask_hn'
        end
      end
      t
    end
    queryType 'prefixLast'
    customRanking ['desc(points)', 'desc(num_comments)']
    ranking ['typo', 'proximity', 'attribute', 'custom']
    separatorsToIndex '+#$'

    add_slave "Item_#{Rails.env}_ordered" do # backward compatibility naming
      attributesToIndex ['title', 'unordered(story_text)', 'unordered(comment_text)', 'unordered(url)', 'author', 'created_at_i']
    end

    add_slave "Item_#{Rails.env}_sort_date" do # backward compatibility naming
      customRanking ['desc(created_at_i)']
    end
  end

  def story_text
    item_type_cd != Item.comment ? text : nil
  end

  def story_title
    comment? && story ? story.title : nil
  end

  def story_url
    comment? && story ? story.url : nil
  end

  def comment_text
    comment? ? text : nil
  end

  def comment?
    item_type_cd == Item.comment
  end

  def num_comments
    item_type_cd == Item.story || item_type_cd == Item.poll ? story_comments.count : nil
  end

  def crawl_thumbnail!
    return true if url.blank? || AWS::S3::S3Object.exists?("#{id}.png", 'hnsearch')
    begin
      temp_file = "/tmp/#{id}.png"
      `#{Rails.root}/crawl_thumbnail.sh "#{url}" "#{temp_file}" >/dev/null 2>&1`
      begin
        AWS::S3::S3Object.store("#{id}.png", open(temp_file), 'hnsearch', access: :public_read)
      ensure
        FileUtils.rm_f temp_file
      end
      puts "Crawled #{url} (#{id}.png)"
      return true
    rescue Exception => e
      return false
    end
  end

  def self.from_api!(id)
    h = Firebase::Client.new(ENV['HN_API_URL']).get("/v0/item/#{id}").body
    raise "Not found" if h.nil?
    item = Item.find_or_initialize_by(id: h['id'])
    raise "Unknown type: #{h['type']}" if h['type'].blank?
    item.item_type = h['type']
    item.author = h['by']
    item.created_at = h['time'] && Time.at(h['time'].to_i)
    item.url = h['url']
    item.title = h['title']
    item.text = h['text']
    item.points = h['score']
    item.parent_id = h['parent']
    item.deleted = h['deleted'] == true
    item.dead = h['dead'] == true
    item.updated_at ||= DateTime.now
    puts "[#{item.created_at}][item] #{item.title}" if item.new_record? and item.item_type == 'story'
    item.save!
  end

  def self.import_from_dump!(path)
    ActiveRecord::Base.transaction do
      Item.without_auto_index do
        Zlib::GzipReader.open(path) do |gz|
          Gem::Package::TarReader.new(gz).each do |entry|
            path = entry.full_name
            puts path
            next if !path.starts_with?('story/') || !path.ends_with?('.json')
            data = entry.read
            json = JSON.parse(data.encode!('UTF-8', :undef => :replace, :invalid => :replace, :replace => '')) rescue nil
            next if json.nil?
            item = Item.find_or_initialize_by(id: json['id'])
            item.deleted ||= json['deleted']
            item.dead ||= json['dead']
            item.item_type = json['type'] || 'unknown'
            item.author = json['by']
            item.created_at = Time.at(json['time'])
            item.url = json['url']
            item.title = json['title']
            item.text = json['text']
            item.points = json['score'] && json['score'].to_i
            #item.children = json['kids']
            item.parent_id = json['parent'] && json['parent'].to_i
            item.parent_id = nil if item.parent_id == 0
            item.save
          end
        end
      end
    end
    Item.reindex!
  end

  def resolve_parent!(force = false)
    return if item_type != 'comment'
    return if !force && self.story_id
    p = self
    while p.parent and p.parent.story_id.nil?
      p = p.parent
    end
    self.story_id = p.parent ? p.parent.story_id : (p.story_id || p.id)
    self.save
  end

  def self.stories_per_hour_since(ago)
    per_hour_since(Item.story, ago)
  end

  def self.comments_per_hour_since(ago)
    per_hour_since(Item.comment, ago)
  end

  private
  def after_create_tasks
    self.delay(priority: 0).resolve_parent! # 0 = top priority
    self.delay(priority: 1).crawl_thumbnail! if !url.blank?
  end

  def self.per_hour_since(item_type, ago)
    Item.where(item_type_cd: item_type).where('created_at > ?', ago).group_by_hour(:created_at).count.map { |k,v| [k.is_a?(String) ? DateTime.parse(k) : k, v] }
  end

  def live?
    !deleted && !dead && !author.blank?
  end

end
