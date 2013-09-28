class Post < ActiveRecord::Base
  include AlgoliaSearch

  algoliasearch do
    attributesToIndex = ["title", "url", "author"]
    customRanking = ["desc(points),desc(best_rank)"]
  end

end
