class MyModel < ActiveRecord::Base

  if ENV['ALGOLIASEARCH_APPLICATION_ID']
    include AlgoliaSearch

    algoliasearch auto_index: false, auto_remove: false do
    end
  end

end
