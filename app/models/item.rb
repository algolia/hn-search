require 'rubygems/package'
require 'zlib'

class Item < ApplicationRecord
  include AlgoliaSearch

  as_enum :item_type, %w[story comment poll pollopt unknown job]

  validates_length_of :url, within: 0..32_768, allow_nil: true, allow_blank: true
  validates_length_of :text, within: 0..32_768, allow_nil: true, allow_blank: true
  validates_length_of :author, within: 0..255, allow_nil: true, allow_blank: true

  after_create :after_create_tasks

  belongs_to :parent, class_name: 'Item', foreign_key: 'parent_id'
  has_many :children, class_name: 'Item', foreign_key: 'parent_id'

  belongs_to :story, class_name: 'Item', foreign_key: 'story_id'
  has_many :story_comments, -> { where('item_type_cd = ?', Item.comment) }, class_name: "Item", foreign_key: "story_id"

  SHOW_HN_RX = /^show hn\b/i.freeze
  ASK_HN_RX = /^ask hn\b/i.freeze
  OLDEST_ARTICLE = Time.at(1_160_418_111).freeze

  algoliasearch per_environment: true, auto_index: false, if: :live? do
    attribute :created_at, :title, :url, :author, :points, :story_text, :comment_text, :author, :num_comments, :story_id, :story_title, :story_url, :parent_id
    attribute :created_at_i do
      created_at.to_i
    end

    attributesToIndex %w[unordered(title) unordered(story_text) unordered(comment_text) unordered(url) author created_at_i]
    attributesToHighlight %w[title story_text comment_text url story_url author story_title]

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
      t << 'front_page' if front_page
      t
    end
    queryType 'prefixLast'
    customRanking %w[desc(points) desc(num_comments)]
    ranking %w[typo proximity attribute custom]
    separatorsToIndex '+#$.'

    add_replica "Item_#{Rails.env}_ordered", inherit: true do # backward compatibility naming
      attributesToIndex %w[title unordered(story_text) unordered(comment_text) unordered(url) author created_at_i]
    end

    add_replica "Item_#{Rails.env}_sort_date", inherit: true do # backward compatibility naming
      customRanking ['desc(created_at_i)']
      ranking ['custom']
    end

    # BEG: virtual replica experiment
    add_replica "vr_Item_#{Rails.env}_ordered", virtual: true do
      attributesToIndex %w[title unordered(story_text) unordered(comment_text) unordered(url) author created_at_i]
    end

    add_replica "vr_Item_#{Rails.env}_sort_date", virtual: true do
      attributesToIndex %w[unordered(title) unordered(story_text) unordered(comment_text) unordered(url) author created_at_i]
      customRanking ['desc(created_at_i)']
      ranking ['custom']
    end
    # END: virtual replica experiment
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
    item_type_cd == Item.story || item_type_cd == Item.poll ? story_comments.where(deleted: false).where(dead: false).count : nil
  end

  def crawl_thumbnail!
    s3 = Aws::S3::Resource.new
    bucket = s3.bucket('hnsearch')
    obj = bucket.object("#{id}.png")
    return true if url.blank? || obj.exists?
    begin
      `#{Rails.root}/crawl_thumbnail.sh "#{url}" #{id} >/dev/null 2>&1`
      begin
        bucket.put_object({
          key: "#{id}.png",
          acl: 'public-read',
          body: open("/tmp/#{id}.png")
        })
        bucket.put_object({
          key: "#{id}-600x315.png",
          acl: 'public-read',
          body: open("/tmp/#{id}-600x315.png")
        })
        bucket.put_object({
          key: "#{id}-240x180.png",
          acl: 'public-read',
          body: open("/tmp/#{id}-240x180.png")
        })
      ensure
        FileUtils.rm_f "/tmp/#{id}-orig.png"
        FileUtils.rm_f "/tmp/#{id}-600x315.png"
        FileUtils.rm_f "/tmp/#{id}-240x180.png"
        FileUtils.rm_f "/tmp/#{id}.png"
      end
      puts "Crawled #{url} (#{id}.png)"
      return true
    rescue Exception => e
      puts e
      return false
    end
  end

  def self.from_api!(id)
    h = Firebase::Client.new(ENV['HN_API_URL']).get("/v0/item/#{id}").body
    return false if h.nil? || h['time'].nil?
    item = Item.find_or_initialize_by(id: h['id'])
    raise "Unknown type: #{h['type']}" if h['type'].blank?
    item.item_type = h['type']
    item.author = h['by']
    item.created_at = Time.at(h['time'].to_i)
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
    ApplicationRecord.transaction do
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
    self.story.update_attributes(updated_at: DateTime.now) if self.story
  end

  def self.stories_per_hour_since(ago)
    per_hour_since(Item.story, ago)
  end

  def self.comments_per_hour_since(ago)
    per_hour_since(Item.comment, ago)
  end

  # Formula provided by Michael Sokol and Julien Paroche
  # https://gist.github.com/JonasBa/8ebed8b9e69bd1e8366577af7dcf8f2c 
  def bucket_date
    self.created_at.beginning_of_week.beginning_of_day
  end

  def epoch_seconds_difference
    self.bucket_date - DateTime.new(1970, 1, 1)
  end

  def relevant_score
    order = Math.log([self.points.to_i, 0].max, 10)
    order = 0 if order < 0

    seconds = epoch_seconds_difference.to_i - OLDEST_ARTICLE.to_i
    (order + seconds / 45_000).round
  end

  private

  def after_create_tasks
    self.delay(priority: 0).resolve_parent! # 0 = top priority
    self.delay(priority: 1).crawl_thumbnail! if !url.blank?
  end

  def per_hour_since(item_type, ago)
    Item.where(item_type_cd: item_type).where('created_at > ?', ago).group_by_hour(:created_at).count.map { |k,v| [k.is_a?(String) ? DateTime.parse(k) : k, v] }
  end

  def live?
    !deleted && !dead && !author.blank?
  end

end
