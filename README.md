HN Search powered by Algolia
==================

This is a Rails 4 application providing a _better_ search experience on HackerNews' submissions. It's based on [algoliasearch-rails](https://github.com/algolia/algoliasearch-rails) and uses [HNSearch API](https://www.hnsearch.com/api) to crawl submissions.

It's currently hosted on [heroku](https://www.heroku.com) and available at [http://hn-search.herokuapp.com](http://hn-search.herokuapp.com).

Configuration
--------------

That's the _whole_ configuration used:

```ruby
class Post < ActiveRecord::Base
  include AlgoliaSearch

  algoliasearch per_environment: true do
    # `title` is more important than `source`, `source` more than `url`, `url` more than `author`
    # btw, do not take into account positions on `title` matches
    attributesToIndex ['unordered(title)', 'source', 'url', 'author']

    # controls the way results are sorted sorting on the following 4 criteria (one after another)
    # I removed the 'exact' match critera (improve <3-words query relevance)
    ranking ['typo', 'proximity', 'attribute', custom']

    # use associated number of HN points to sort results (last sort criteria)
    customRanking ['desc(points)']

    # perform prefix matching on all words
    queryType 'prefixAll'

    # google+, $1.5M raises, C#: we love you
    separatorsToIndex '+#$'
  end

end
```

Dependencies
-------------

```ruby
ruby '1.9.3'

gem 'algoliasearch-rails'
```

Installation
--------------

* ```git clone https://github.com/algolia/hn-search.git```
*  ```bundle install```
*  ```bundle exec rake db:migrate```
*  Create your ```config/application.yml``` based on ```config/application.example.yml``` with your [Algolia](http://www.algolia.com) credentials
*  ```bundle exec rake db:seed``` (please be patient, the bzip2-json file is huge)
*  ```bundle exec rails server```
*  Enjoy your ```http://localhost:3000``` HN search!

Credits
--------
    
* [Snapito](http://snapito.com) for thumbnails generation
* [srw](https://gist.github.com/srw/1360455) for original idea on how to export HN
