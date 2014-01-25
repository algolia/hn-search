HN Search powered by Algolia
==================

This is the Rails 4 application providing [HN Search](http://hn.algolia.com). It's based on [algoliasearch-rails](https://github.com/algolia/algoliasearch-rails) and uses [wkhtmltoimage](https://code.google.com/p/wkhtmltopdf/) to crawl thumbnails.

Configuration
--------------

```ruby
class Item < ActiveRecord::Base
  include AlgoliaSearch

  algoliasearch per_environment: true do
    # the list of attributes sent to Algolia's API
    attribute :created_at, :title, :url, :author, :points, :story_text, :comment_text, :author, :num_comments, :story_id, :story_title, :
    attribute :created_at_i do
      created_at.to_i
    end

    # `title` is more important than `{story,comment}_text`, `{story,comment}_text` more than `url`, `url` more than `author`
    # btw, do not take into account position in most fields to avoid first word match boost
    attributesToIndex ['unordered(title)', 'unordered(story_text)', 'unordered(comment_text)', 'unordered(url)', 'author', 'created_at_i']

    # list of attributes to highlight
    attributesToHighlight ['title', 'story_text', 'comment_text', 'url', 'story_url', 'author', 'story_title']

    # tags used for filtering
    tags do
      [item_type, "author_#{author}", "story_#{story_id}"]
    end

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
    item_type_cd != Item.comment ? text : nil
  end

  def story_title
    comment? && story ? story.title : nil
  end

  def story_url
    comment? && story ? story.url : nil
  end

  def comment_text
    comment? ? text : nil
  end

  def comment?
    item_type_cd == Item.comment
  end
end
```

Credits
--------
    
* [HackerNews](https://news.ycombinator.com) for the real-time export API
* [wkhtmltoimage](https://code.google.com/p/wkhtmltopdf/) to back the thumbnails' crawl
