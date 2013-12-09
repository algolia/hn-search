require 'rubygems/package'
require 'zlib'

class User < ActiveRecord::Base

  validates_length_of :username, within: 1..255, allow_nil: false, allow_blank: false
  validates_length_of :about, within: 0..65535, allow_nil: true, allow_blank: true

  include AlgoliaSearch
  algoliasearch per_environment: true, id: :username do
    attributesToIndex ['username', 'about', 'karma']
    customRanking ['desc(karma)']
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
