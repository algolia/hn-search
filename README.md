HN Search powered by Algolia
==================

This is the Rails 4 application providing [HN Search](http://hn.algolia.com). It's mainly based on [angular.js](https://github.com/angular/angular.js), [algoliasearch-rails](https://github.com/algolia/algoliasearch-rails) and uses [wkhtmltoimage](https://code.google.com/p/wkhtmltopdf/) to crawl+render thumbnails.

Development/Contributions
-------------

We *love* pull-requests :)

### Setup

```sh
# clone the repository
git clone https://github.com/algolia/hn-search
cd hn-search

# install dependencies
bundle install

# setup credentials
cp config/database.example.yml config/database.yml # feel free to edit, default configuration is OK for search-only
cp config/application.example.yml config/application.yml # feel free to edit, default configuration is OK for search-only

# setup your (sqlite3) database
rake db:migrate

# start contributing enjoying Guard (watchers, livereload, notifications, ...)
guard

# done!
open http://localhost:3000
```

### Code

If you want to contribute to the UI, the only directory you need to look at is `app/assets`. This directory contains all the JS, HTML & CSS code.

### Deployment

To deploy, we're using capistrano and therefore you need SSH access to the underlying machines and run from your own computer:

```shell
bundle exec cap deploy
```

There is currently (December 2018) a bug with `bluepill` stopping the deployment. To workaround it, you need to force a restart with the following command instead:

```shell
bundle exec cap deploy:restart
```


Indexing Configuration
--------------

The indexing is configured using the following `algoliasearch` block:

```ruby
class Item < ActiveRecord::Base
  include AlgoliaSearch

  algoliasearch per_environment: true do
    # the list of attributes sent to Algolia's API
    attribute :created_at, :title, :url, :author, :points, :story_text, :comment_text, :author, :num_comments, :story_id, :story_title
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
* [HackerNews](https://news.ycombinator.com)
* [Firebase](https://www.firebase.com) for the real-time crawling API
* [wkhtmltoimage](https://code.google.com/p/wkhtmltopdf/) to back the thumbnails' crawl+rendering


