require 'rubygems/package'
require 'zlib'

class User < ActiveRecord::Base

  validates_length_of :username, within: 1..255, allow_nil: false, allow_blank: false
  validates_length_of :about, within: 0..65535, allow_nil: true, allow_blank: true

  include AlgoliaSearch
  algoliasearch per_environment: true, id: :username do
    attributesToIndex ['username', 'about', 'karma']
    customRanking ['desc(karma)']
    separatorsToIndex '_-'
  end

  EXPORT_REGEXP = %r{^\("(.+)" (?:nil|"(.*)") (\d+) (-?\d+) (?:nil|(-?\d+)/?(-?\d*)) (?:nil|"(.*)")\)$}

  def self.crawl!(id)
    return if User.find_by_username(id)
    url = "#{ENV['HN_SECRET_REALTIME_EXPORT_USER_URL']}#{id}"
    line = open(url).read
    m = line.encode!('UTF-8', :undef => :replace, :invalid => :replace, :replace => '').scan(EXPORT_REGEXP).first
    raise ArgumentError.new(line) unless m
    u = User.new
    u.username = m[0]
    u.created_at = m[2] && Time.at(m[2].to_i)
    u.karma = m[3]
    u.avg = m[4].to_i > 0 && m[5].to_i > 0 ? m[4].to_i / m[5].to_f : 0
    u.about = m[6]
    u.save
  end

  def self.cumulated_per_month
    sum = 0
    User.group_by_month(:created_at).count.map do |k,v|
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
