require 'rubygems/package'
require 'zlib'

class Item < ActiveRecord::Base

  as_enum :item_type, %w{story comment poll pollopt unknown}

  validates_length_of :url, within: 0..32768, allow_nil: true, allow_blank: true
  validates_length_of :text, within: 0..32768, allow_nil: true, allow_blank: true
  validates_length_of :author, within: 0..255, allow_nil: true, allow_blank: true

  after_save :crawl_thumbnail!

  belongs_to :parent, class_name: "Item", foreign_key: "parent_id"
  has_many :children, class_name: "Item", foreign_key: "parent_id"

  belongs_to :story, class_name: "Item", foreign_key: "story_id"
  has_many :story_comments, class_name: "Item", foreign_key: "story_id"

  include AlgoliaSearch
  algoliasearch per_environment: true do
    attribute :title, :source, :url, :author, :points, :text, :author, :_tags, :num_comments
    attributesToIndex ['unordered(title)', 'text', 'unordered(source)', 'unordered(url)', 'author']
    customRanking ['desc(points)']
    ranking ['typo', 'proximity', 'attribute', 'custom']
    queryType 'prefixAll'
    separatorsToIndex '+#$'
  end

  def source
    url && URI(url).host
  end

  def _tags
    [item_type]
  end

  def num_comments
    item_type == 'story' ? story_comments.count : 0
  end

  def crawl_thumbnail!
    return true if url.blank? || AWS::S3::S3Object.exists?("#{id}.png", 'hnsearch')
    begin
      temp_file = "/tmp/#{id}.png"
      `#{Rails.root}/crawl_thumbnail.sh "#{url}" "#{temp_file}" >/dev/null 2>&1`
      begin
        AWS::S3::S3Object.store("#{id}.png", open(tmp_file), 'hnsearch', access: :public_read)
      ensure
        FileUtils.rm_f temp_file
      end
      return true
    rescue Exception => e
      return false
    end
  end

  EXPORT_REGEXP = %r{^\((\d+) (story|comment) "(.+)" (\d+) (?:nil|"(.*)") (?:nil|"(.+)") (?:nil|"(.*)") (?:nil|-?(\d+)) (?:nil|\(([\d ]+)\)) (?:nil|(\d+))\)$}

  def self.refresh_since!(id)
    export = open("#{ENV['HN_SECRET_REALTIME_EXPORT_URL']}#{id}").read
    ids = []
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
        item.save
        ids << id
      end
    end
    Item.includes(:story_comments).where(id: ids).reindex!
  end

  def self.import_from_dump!(path)
    Item.skip_callback(:save, :after, :crawl_thumbnail!)
    begin
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
              item.parent_id = json['parent_id'] && json['parent_id'].to_i
              item.save
            end
          end
        end
      end
    ensure
      Item.set_callback(:save, :after, :crawl_thumbnail!)
    end
    Item.includes(:story_comments).reindex!
  end

  def self.resolve_parents!
    Item.where(item_type_cd: Item.comment).where(story_id: nil).find_each do |i|
      p = i.parent
      while p and p.parent
        p = p.parent
      end
      i.update_attribute :story_id, p.id if p && p.item_type_cd == Item.story
    end
  end

end
