require 'rubygems/package'
require 'zlib'

class User < ActiveRecord::Base

  validates_length_of :username, within: 1..255, allow_nil: false, allow_blank: false
  validates_length_of :about, within: 0..65535, allow_nil: true, allow_blank: true

  has_many :items, foreign_key: "author", primary_key: 'username'

  include AlgoliaSearch
  algoliasearch per_environment: true, id: :username, auto_index: false do
    add_attribute :submission_count, :comment_count
    add_attribute :created_at_i do
      created_at.to_i
    end
    attributesToIndex ['username', 'about']
    customRanking ['desc(karma)']
    separatorsToIndex '_-'
  end

  def submission_count
    items.where(item_type_cd: [Item.story, Item.poll]).count
  end

  def comment_count
    items.where(item_type_cd: Item.comment).count
  end

  EXPORT_REGEXP = %r{^\("(.+)" (?:nil|"(.*)") (\d+) (-?\d+) (?:nil|(-?\d+)/?(-?\d*)) (?:nil|"(.*)")\)$}

  def self.from_api!(id)
    h = Firebase::Client.new(ENV['HN_API_URL']).get("/v0/user/#{id}").body
    u = User.find_or_initialize_by(username: h['id'])
    u.created_at = Time.at(h['created'])
    u.karma = h['karma']
    u.delay = h['delay']
    u.submitted = h['submitted'].size
    u.about = h['about']
    u.updated_at = DateTime.now
    puts "[#{u.created_at}][user] #{u.username}" if u.new_record?
    u.save!
  end

  def self.cumulated_per_month
    sum = 0
    User.where('karma > 0').group_by_month(:created_at).count.map do |k,v|
      sum += v
      [k.is_a?(String) ? DateTime.parse(k) : k, sum]
    end
  end

  def self.import_from_dump!(path)
    ActiveRecord::Base.transaction do
      User.without_auto_index do
        Zlib::GzipReader.open(path) do |gz|
          Gem::Package::TarReader.new(gz).each do |entry|
            path = entry.full_name
            p path
            next if !path.starts_with?('profile/') || !path.ends_with?('.json')
            data = entry.read
            json = JSON.parse(data.encode!('UTF-8', :undef => :replace, :invalid => :replace, :replace => '')) rescue nil
            next if json.nil?
            user = User.find_or_initialize_by(username: json['id'])
            user.karma = json['karma'].to_i
            user.avg = json['avg'].to_f
            user.about = json['about']
            user.created_at = json['created'] && Time.at(json['created'])
            user.save
          end
        end
      end
    end
    User.reindex!
  end

end
