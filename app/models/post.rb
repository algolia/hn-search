class Post < ActiveRecord::Base
  include AlgoliaSearch

  algoliasearch synchronous: false do
  end

end
