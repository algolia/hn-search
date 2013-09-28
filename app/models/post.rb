class Post < ActiveRecord::Base

  if ENV['ALGOLIASEARCH_APPLICATION_ID']
    include AlgoliaSearch

    algoliasearch synchronous: false do
      attributesToIndex ["title", "source", "author"]
      customRanking ["desc(points)", "asc(best_rank)"]
    end
  end

end
