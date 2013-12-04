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
    attribute :title, :url, :author, :points, :story_text, :comment_text, :author, :_tags, :num_comments, :story_id, :story_title, :story_url

    # `title` is more important than `source`, `source` more than `url`, `url` more than `author`
    # btw, do not take into account positions on `title` and `url` matches
    attributesToIndex ['unordered(title)', 'story_text', 'comment_text', 'unordered(url)', 'author']

    # use associated number of HN points to sort results (last sort criteria)
    customRanking ['desc(points)', 'desc(num_comments)']

    # controls the way results are sorted sorting on the following 4 criteria (one after another)
    # I removed the 'exact' match critera (improve 1-words query relevance, doesn't fit HNSearch needs)
    ranking ['typo', 'proximity', 'attribute', 'custom']

    # perform prefix matching on all words
    queryType 'prefixAll'

    # google+, $1.5M raises, C#: we love you
    separatorsToIndex '+#$'
  end

  def story_text
    item_type != 'comment' ? text : nil
  end

  def story_title
    item_type == 'comment' && story ? story.title : nil
  end

  def story_url
    item_type == 'comment' && story ? story.url : nil
  end

  def comment_text
    item_type == 'comment' ? text : nil
  end

  def num_comments
    item_type == 'story' ? story_comments.size : nil
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
