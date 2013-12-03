class User < ActiveRecord::Base

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
            next if !path.starts_with?('profile/') || !path.ends_with?('.json')
            data = entry.read
            json = JSON.parse(data.encode!('UTF-8', :undef => :replace, :invalid => :replace, :replace => '')) rescue nil
            # FIXME
          end
        end
      end
    end
    User.reindex!
  end


end
