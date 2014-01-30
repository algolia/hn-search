Number.prototype.number_with_delimiter = function(delimiter) {
    var number = this + '', delimiter = delimiter || ',';
    var split = number.split('.');
    split[0] = split[0].replace(
        /(\d)(?=(\d\d\d)+(?!\d))/g,
        '$1' + delimiter
    );
    return split.join('.');
};

(function($) {
  window.HNSearch = function(applicationID, apiKey, indexName, userIndexName) {
    this.init(applicationID, apiKey, indexName, userIndexName);
  }

  HNSearch.prototype = {
    init: function(applicationID, apiKey, indexName, userIndexName) {
      var self = this;

      var client = new AlgoliaSearch(applicationID, apiKey, null, true, [applicationID + '-2.algolia.io', applicationID + '-3.algolia.io']);
      this.idx = client.initIndex(indexName);
      this.idx_user = client.initIndex(userIndexName);
      this.idx_by_date = client.initIndex(indexName + '_sort_date');
      this.$hits = $('#hits');
      this.$pagination = $('#pagination');
      this.$stats = $('#stats');
      this.$noresults = $('#noresults');
      this.page = 0;
      this.firstQuery = true;
      this.hitTemplate = Hogan.compile($('#hitTemplate').text());
      this.prefixedSearch = true;

      $('#inputfield input').tagautocomplete({
        character: 'author:',
        source: function(query, process) {
          var tquery = this.extractor();
          if(!tquery) {
            return [];
          }
          var author = tquery.substring(this.options.character.length);
          self.idx_user.search(author, function(success, content) {
            if (success) {
              var authors = [];
              for (var i = 0; i < content.hits.length; ++i) {
                authors.push(content.hits[i]._highlightResult.username.value);
              }
              process(authors);
            }
          });
        }
      });

      $('#search-form').submit(function(e) {
        e.preventDefault();
        // disable prefix search on form submitting
        self.prefixedSearch = false;
        self.search(0);
      });
      $('#inputfield input').keyup(function(e) {
        $('#inputfield input').tagautocomplete(['keyup', e]);
        switch (e.keyCode) {
          case 13: return false;
          case 27: $('#inputfield input').val(''); break;
          default: self.prefixedSearch = true; break;
        }
        self.search(0);
      }).keypress(function(e) {
        $('#inputfield input').tagautocomplete(['keypress', e]);
      }).keydown(function(e) {
        $('#inputfield input').tagautocomplete(['keydown', e]);
      }).focus(function(e) {
        $('#inputfield input').tagautocomplete(['focus', e]);
      }).blur(function(e) {
        $('#inputfield input').tagautocomplete(['blur', e]);
      }).change(function(e) {
        self.search(0);
      });
      $('input[type="radio"]').change(function(e) {
        self.search(0);
      });

      if ($('#inputfield input').val() !== '') {
        // that's a query from news.ycombinator.com, disable prefix search
        this.prefixedSearch = false;
      }

      if (location.hash && location.hash.indexOf('#!/') === 0) {
        var parts = location.hash.substring(3).split('/');
        $('input[name="item_type"][value="' + parts.shift() + '"]').prop('checked', true);
        $('input[name="created_at"][value="' + parts.shift() + '"]').prop('checked', true);
        var v = parts.shift();
        if (v === 'prefix') {
          this.prefixedSearch = true;
          this.page = parseInt(parts.shift());
        } else {
          this.prefixedSearch = false;
          this.page = parseInt(v);
        }
        $('#inputfield input').val(decodeURIComponent(parts.join('/')));
      }

      if ($('#inputfield input').val() !== '') {
        this.search(0);
      } else {
        $('#inputfield input').focus();

        // resolve DNS
        this.idx.search('', function(success, content) { });
      }
    },

    follow: function(story_id) {
      this.follow_cache = this.follow_cache || {};
      this.idx_by_date.clearCache();
      this.search(0, { query: 'story:' + story_id, hitsPerPage: 1000, created_at: 'sort_by_date', item_type: 'all', url: false });
      var self = this;
      setTimeout(function() {
        self.follow_cache_notify = true;
        self.follow(story_id);
      }, 60000);
    },

    notify: function(hit) {
      if (typeof this.follow_cache === 'undefined' || this.follow_cache[hit.objectID]) {
        return;
      }
      this.follow_cache[hit.objectID] = hit;
      if (!this.follow_cache_notify) {
        return;
      }
      var Notification = window.Notification || window.mozNotification || window.webkitNotification;
      new Notification((hit.title || hit.story_title), {
        body: (hit.url || hit.text || hit.story_text || hit.comment_text || ''),
        icon: ('http://drcs9k8uelb9s.cloudfront.net/' + (hit.story_id || hit.id) + '.png')
      });
    },

    search: function(p, args) {
      var args = args || { url: true };

      if (this.page < 0 || this.page > 40) {
        // hard limit
        return;
      }
      this.page = p;

      var query = $('#inputfield input').val() || args.query;
      if (!query || query.trim().length == 0) {
        this.$hits.empty();
        this.$pagination.empty();
        this.$stats.empty();
        this.$noresults.hide();
        return;
      }
      query = query.trim();

      var originalQuery = query;
      var searchParams = {
        hitsPerPage: args.hitsPerPage || 25,
        page: p,
        getRankingInfo: 1,
        minWordSizefor1Typo: 5,
        minWordSizefor2Typos: 9,
        tagFilters: [],
        numericFilters: []
      };
      var idx = this.idx;
      var now = new Date(); 
      var now_utc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()) / 1000;

      var created_at = $('#created_at input[name="created_at"]:checked').val() || args.created_at;
      switch (created_at) {
        case 'last_24h':
          searchParams.numericFilters.push('created_at_i>=' + (now_utc - 24*60*60));
          break;
        case 'past_week':
          searchParams.numericFilters.push('created_at_i>=' + (now_utc - 7*24*60*60));
          break;
        case 'past_month':
          searchParams.numericFilters.push('created_at_i>=' + (now_utc - 30*24*60*60));
          break;
        case 'sort_by_date':
          idx = this.idx_by_date;
          searchParams.minWordSizefor1Typo = searchParams.minWordSizefor2Typos = 1000;
          break;
      }

      var item_type = $('#item_type input[name="item_type"]:checked').val() || args.item_type;
      if (item_type && item_type !== 'all') {
        if (item_type === 'poll') {
          searchParams.tagFilters.push(['poll', 'pollopt']);
        } else {
          searchParams.tagFilters.push(item_type);
        }
      }

      if (args.url) {
        location.replace('#!/' + (item_type || '') + '/' + (created_at || '') + '/' + (this.prefixedSearch ? 'prefix/' : '') + this.page + '/' + originalQuery);
      }

      var authors = [];
      while (true) {
        var matches = query.match('author:([^ ]+)');
        if (!matches) {
          break;
        }
        if (matches.length > 0) {
          authors.push(matches[1]);
          query = query.replace('author:' + matches[1], '');
        }
      }
      if (authors.length > 0) {
        var tags = [];
        for (var i = 0; i < authors.length; ++i) {
          tags.push('author_' + authors[i]);
        }
        searchParams.tagFilters.push(tags);
      }

      var stories = [];
      while (true) {
        var matches = query.match('story:([0-9]+)');
        if (!matches) {
          break;
        }
        if (matches.length > 0) {
          stories.push(matches[1]);
          query = query.replace('story:' + matches[1], '');
        }
      }
      if (stories.length > 0) {
        var tags = [];
        for (var i = 0; i < stories.length; ++i) {
          tags.push('story_' + stories[i]);
        }
        searchParams.tagFilters.push(tags);
      }

      if (!this.prefixedSearch) {
        searchParams.queryType = 'prefixNone';
      }

      var self = this;
      idx.search(query, function(success, content) {
        if (!success) {
          console.log(content);
          return;
        }
        if (originalQuery == ($('#inputfield input').val() || args.query).trim()) {
          if (content.nbHits == 0) {
            var noResults = '<p>No results matching your query</p><p><code>' + $('<div />').text(originalQuery).html() + '</code>';
            if (item_type) {
              noResults += ' + <code>type=' + $('<div />').text(item_type).html().replace(/_/g, ' ') + '</code>';
            }
            if (created_at) {
              noResults += ' + <code>when=' + $('<div />').text(created_at).html().replace(/_/g, ' ') + '</code>';
            }
            noResults += '</p>';
            self.$noresults.html(noResults);
            self.$noresults.show();
          } else {
            self.$noresults.hide();
          }
          self.searchCallback(content);
        }
      }, searchParams);
    },

    searchCallback: function(content) {
      if (this.page != content.page) {
        return;
      }

      var stats = '';
      if (content.nbHits > 0) {
        stats += 'Page <b>' + (content.page + 1) + ' of ' + content.nbPages + '</b>, ';
        stats += content.nbHits > 1000 ? 'about' : 'got';
        stats += ' <b>' + content.nbHits.number_with_delimiter() + ' result' + (content.nbHits > 1 ? 's' : '') + '</b>';
        stats += ' in <b>' + (content.processingTimeMS < 100 ? ('<a href="http://www.algolia.com">' + content.processingTimeMS + ' ms</a>') : (content.processingTimeMS + ' ms')) + '</b>';
      }
      this.$stats.html(stats);
      
      var res = '';
      for (var i = 0; i < content.hits.length; ++i) {
        var hit = content.hits[i];
        var type = hit._tags[0]; // first tag stores the item type
        var item_url = 'https://news.ycombinator.com/item?id=' + (hit.story_id ? hit.story_id : hit.objectID);

        // look & feel
        var classes = ['hit'];
        /// cosmetics
        if ((i % 2) == 1) {
          classes.push('odd');
        }
        /// type
        classes.push(type);
        /// relevancy
        var nbWords = content.query.split(/[\s\.,-\/#!$%\^&\*;:{}=\-_`~()]+/g).length;
        if (hit._rankingInfo.nbTypos === 0 && (nbWords === 1 || hit._rankingInfo.nbExactWords >= nbWords)) {
          classes.push('notypo');
        }

        // prepare template parameters
        var v = {
          classes: classes.join(' '),
          item_id: hit.objectID,
          created_at: new Date(hit.created_at_i * 1000).toISOString(),
          points: hit.points,
          points_plural: (hit.points > 1),
          author: hit.author,
          highlighted_author: (hit._highlightResult && hit._highlightResult.author.value) || ''
        };
        if (type === 'story' || type === 'poll' || type === 'pollopt') {
          v.item_url = item_url;
          v.highlighted_title = hit._highlightResult.title.value;
          if (hit.url) {
            v.highlighted_url = hit._highlightResult.url.value;
          }
          v.thumb_item_id = hit.objectID;
          v.url = (hit.url || item_url);
          v.comments = hit.num_comments;
          v.comments_plural = hit.num_comments > 1;
          if (hit.story_text) {
            v.story_text = this.highlightedTextCleanup(hit._highlightResult.story_text.value);
          }
          v.has_comments = true;
        } else if (type === 'comment') {
          v.thumb_item_id = hit.story_id;
          if (hit.story_title) {
            v.highlighted_story_title = hit._highlightResult.story_title && hit._highlightResult.story_title.value;
            if (hit.story_url) {
              v.highlighted_story_url = hit._highlightResult.story_url && hit._highlightResult.story_url.value;
              v.story_url = hit.story_url;
            }
          }
          if (hit.story_id) {
            v.item_url = 'https://news.ycombinator.com/item?id=' + hit.story_id;
            v.item_url_anchor = '#up_' + hit.objectID;
          } else {
            v.item_url = item_url;
          }
          if (hit.comment_text) {
            v.comment_text = this.highlightedTextCleanup(hit._highlightResult.comment_text.value);
          }
        }
        this.notify(hit);
        res += this.hitTemplate.render(v);
      }
      this.$hits.html(res);
      $('#hits .timeago').timeago();

      // pagination
      var pagination = '';
      if (content.nbHits > 0) {
        pagination += '<ul class="pagination">';
        var prevLink = content.page == 0 ? 'void' : 'window.hnsearch.previousPage()'
        pagination += '<li class="' + (content.page == 0 ? 'disabled' : '') + '"><a href="javascript:' + prevLink + '">«</a></li>';
        var ellipsis1 = -1;
        var ellipsis2 = -1;
        var n = 0;
        for (var i = 0; i < content.nbPages; ++i) {
          if (content.nbPages > 10 && i > 2 && i < (content.nbPages - 2) && (i < (content.page - 2) || i > (content.page + 2))) {
            if (ellipsis1 == -1 && i > 2) {
              pagination += '<li class="disabled"><a href="#">&hellip;</a></li>';
              ellipsis1 = n;
            }
            if (ellipsis2 == -1 && i > content.page && i < (content.nbPages - 2)) {
              if (ellipsis1 != n) {
                pagination += '<li class="disabled"><a href="#">&hellip;</a></li>';
              }
              ellipsis2 = n;
            }
            continue;
          }
          pagination += '<li class="' + (i == content.page ? 'active' : '') + '"><a href="javascript:window.hnsearch.gotoPage(' + i + ')">' + (i + 1) + '</a></li>';
          ++n;
        }
        var nextLink = content.page >= content.nbPages - 1 ? 'void' : 'window.hnsearch.nextPage()'
        pagination += '<li class="' + (content.page >= content.nbPages - 1 ? 'disabled' : '') + '"><a href="javascript:' + nextLink + '">»</a></li>';
        pagination += '</ul>';
      }
      this.$pagination.html(pagination);

      if (this.firstQuery) {
        window.scrollTo(0, 1); // work-around chrome scrolling bug
        this.firstQuery = false;
      }
    },

    previousPage: function() {
      this.gotoPage(this.page - 1);
    },

    nextPage: function() {
      this.gotoPage(this.page + 1);
    },

    gotoPage: function(page) {
      window.scrollTo(0, 0);
      this.search(page);
    },

    highlightedTextCleanup: function(str) {
      // handle line breaks
      str = str.replace(/(\\r)?\\n/g, '<br />');

      // remove stopwords highlighting
      str = str.replace(/<em>(a|an|s|is|and|are|as|at|be|but|by|for|if|in|into|is|it|no|not|of|on|or|such|the|that|their|then|there|these|they|this|to|was|will|with)<\/em>/ig, '$1');

      // work-around =\\" escaping bug (6c92ae092359647c04804876139516163d0567de)
      str = str.replace(/=\\"/g, '="')

      // remove highlighted href attributes breaking links
      while (true) {
        var matches = str.match('href="(.*<em>.*[^"]+)"');
        if (!matches) {
          break;
        }
        str = str.replace(matches[0], 'href="' + matches[1].replace(/<\/?em>/g, '') + '"');
      }

      return str;
    },

    toggleStyle: function() {
      var clazz;
      switch (($('body').attr('class') || '').trim()) {
      case 'default':
      case '':
        clazz = 'legacy';
        break;
      case 'legacy':
        clazz = 'default';
      }
      $('body').attr('class', clazz);
      $.cookie('style', clazz);
      $('#style-toggler span').text('(' + clazz + ')');
    },

  }
})(jQuery);
