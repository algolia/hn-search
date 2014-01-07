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
  has_many :story_comments, class_name: "Item", foreign_key: "story_id"

  include AlgoliaSearch
  algoliasearch per_environment: true do
    attribute :created_at, :title, :url, :author, :points, :story_text, :comment_text, :author, :_tags, :num_comments, :story_id, :story_title, :story_url
    attributesToIndex ['unordered(title)', 'story_text', 'comment_text', 'unordered(url)', 'author']
    customRanking ['desc(points)', 'desc(num_comments)']
    ranking ['typo', 'proximity', 'attribute', 'custom']
    queryType 'prefixAll'
    separatorsToIndex '+#$'
  end

  def story_text
    item_type != 'comment' ? text : nil
  end

  def story_title
    item_type == 'comment' && story ? story.title : nil
  end

  def story_url
    item_type == 'comment' && story ? story.url : nil
  end

  def comment_text
    item_type == 'comment' ? text : nil
  end

  def num_comments
    item_type == 'story' ? story_comments.count : nil
  end

  def _tags
    [item_type]
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

  EXPORT_REGEXP = %r{^\((\d+) (story|comment|poll|pollopt) "(.+)" (\d+) (?:nil|"(.*)") (?:nil|"(.+)") (?:nil|"(.*)") (?:nil|-?(\d+)) (?:nil|\(([\d ]+)\)) (?:nil|(\d+))\)$}

  def self.refresh_since!(id)
    id = 1 if id < 1
    url = "#{ENV['HN_SECRET_REALTIME_EXPORT_ITEM_URL']}#{id}"
    puts "====================== #{url}"
    export = open(url).read
    items = []
    Item.without_auto_index do
      export.split("\n").each do |line|
        m = line.encode!('UTF-8', :undef => :replace, :invalid => :replace, :replace => '').scan(EXPORT_REGEXP).first
        raise ArgumentError.new(line) unless m
        id = m[0].to_i
        item = Item.find_or_initialize_by(id: id)
        item.item_type = m[1] ||'unknown'
        item.author = m[2]
        item.created_at = m[3] && Time.at(m[3].to_i)
        item.url = m[4]
        item.title = m[5]
        item.text = m[6]
        item.points = m[7] && m[7].to_i
        #item.children: m[8] && m[8].split(' ').map { |s| s.to_i }
        item.parent_id = m[9] && m[9].to_i
        puts "#{item.created_at}: #{item.title}" if item.new_record? and item.item_type == 'story'
        item.save rescue "not fatal"
        items << item
      end
    end
    items
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
            item.item_type = json['type'] || 'unknown'
            item.author = json['by']
            item.created_at = json['time'] && Time.at(json['time'])
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
    return if !force && (self.story_id || self.item_type != 'comment')
    Item.without_auto_index do
      p = self
      while p.parent and p.parent.story_id.nil?
        p = p.parent
      end
      self.story_id = p.parent ? p.parent.story_id : (p.story_id || p.id)
      self.save
    end
  end

  def crawl_author!
    User.crawl!(author)
  end

  def self.stories_per_hour_since(ago)
    per_hour_since(Item.story, ago)
  end

  def self.comments_per_hour_since(ago)
    per_hour_since(Item.comment, ago)
  end

  private
  def after_create_tasks
    self.delay(priority: 0).resolve_parent!  # 0 = top priority
    self.delay(priority: 1).crawl_thumbnail!
    self.delay(priority: 2).crawl_author!
  end

  def self.per_hour_since(item_type, ago)
    Item.where(item_type_cd: item_type).where('created_at > ?', ago).group_by_hour(:created_at).count.map { |k,v| [k.is_a?(String) ? DateTime.parse(k) : k, v] }
  end

end
