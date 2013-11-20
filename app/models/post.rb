class Post < ActiveRecord::Base

  include AlgoliaSearch

  algoliasearch do
    attributesToIndex ["title", "source", "url", "author"]
    customRanking ["desc(points)", "asc(best_rank)"]
  end

end
