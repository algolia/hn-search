class Post < ActiveRecord::Base
  include AlgoliaSearch

  algoliasearch synchronous: false do
    attributesToIndex = ["title", "url", "author"]
    customRanking = ["desc(points)", "desc(best_rank)"]
  end

end
