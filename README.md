HN Search powered by Algolia
==================

This is the Rails 4 application providing [HN Search](hnsearch.algolia.com). It's based on [algoliasearch-rails](https://github.com/algolia/algoliasearch-rails) and uses [wkhtmltoimage](https://code.google.com/p/wkhtmltopdf/) to crawl thumbnails.

Configuration
--------------

```ruby
class Item < ActiveRecord::Base
  include AlgoliaSearch

  algoliasearch per_environment: true do
    # the list of attributes to send to Algolia's API
    attribute :title, :source, :url, :author, :points, :text, :author, :_tags

    # `title` is more important than `source`, `source` more than `url`, `url` more than `author`
    # btw, do not take into account positions on `title` and `url` matches
    attributesToIndex ['unordered(title)', 'text', 'unordered(source)', 'unordered(url)', 'author']

    # controls the way results are sorted sorting on the following 4 criteria (one after another)
    # I removed the 'exact' match critera (improve {1,2,3}-words query relevance, doesn't fit HNSearch needs)
    ranking ['typo', 'proximity', 'attribute', 'custom']

    # use associated number of HN points to sort results (last sort criteria)
    customRanking ['desc(points)']

    # perform prefix matching on all words
    queryType 'prefixAll'

    # google+, $1.5M raises, C#: we love you
    separatorsToIndex '+#$'
  end

  def source
    url && URI(url).host
  end

  def _tags
    [item_type]
  end

end
```

Credits
--------
    
* [HackerNews](https://news.ycombinator.com) for the real-time export API
* [wkhtmltoimage](https://code.google.com/p/wkhtmltopdf/) to back the thumbnails' crawl
* [Snapito](http://snapito.com) for the original thumbnails crawl
