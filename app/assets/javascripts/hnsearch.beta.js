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
  window.HNSearch = function(applicationID, apiKey, indexName) {
    this.init(applicationID, apiKey, indexName);
  }

  HNSearch.prototype = {
    init: function(applicationID, apiKey, indexName) {
      var self = this;

      this.idx = new AlgoliaSearch(applicationID, apiKey, null, true, [applicationID + '-2.algolia.io', applicationID + '-3.algolia.io']).initIndex(indexName);
      this.$hits = $('#hits');
      this.$pagination = $('#pagination');
      this.$stats = $('#stats');
      this.$noresults = $('#noresults');
      this.page = 0;

      $('#inputfield input').keyup(function(e) {
        self.search(0);
      });
      $('input[type="radio"]').change(function(e) {
        self.search(0);
      });

      if ($('#inputfield input').val() !== '') {
        this.search(0);
      } else {
        $('#inputfield input').focus();

        // resolve DNS
        this.idx.search('', function(success, content) { });
      }
    },

    search: function(p) {
      if (this.page < 0 || this.page > 40) {
        // hard limit
        return;
      }
      this.page = p;

      var query = $('#inputfield input').val().trim();
      if (query.length == 0) {
        this.$hits.empty();
        this.$pagination.empty();
        this.$stats.empty();
        this.$noresults.hide();
        return;
      }

      var originalQuery = query;
      var searchParams = { hitsPerPage: 25, page: p, getRankingInfo: 1, tagFilters: [], numericFilters: [] };
      var now = new Date(); 
      var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()).getTime() / 1000;

      var created_at = $('#created_at input[name="created_at"]:checked').val();
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
      }

      var item_type = $('#item_type input[name="item_type"]:checked').val();
      if (item_type && item_type !== 'all') {
        if (item_type === 'poll') {
          item_type = ['poll', 'pollopt'];
        }
        searchParams.tagFilters.push(item_type);
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

      var self = this;
      this.idx.search(query, function(success, content) {
        if (!success) {
          console.log(content);
          return;
        }
        if (originalQuery == $('#inputfield input').val().trim()) {
          if (content.nbHits == 0) {
            self.$noresults.html('<p>No results matching your query:<code>' + originalQuery + '<code><p>');
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
        stats += ' in <b>' + content.processingTimeMS + ' ms</b>';
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

        // content
        res +=  '<div class="' + classes.join(' ') + '" data-id="' + hit.objectID + '">';
        if (type === 'story' || type === 'poll' || type === 'pollopt') {
          res += '  <div class="thumb pull-left hidden-xs"><img src="//drcs9k8uelb9s.cloudfront.net/' + hit.objectID + '.png" /></div>' +
            '  <div class="title_url">' +
            '    <div class="title"><a href="' + (hit.url || item_url) + '" target="_blank">' + hit._highlightResult.title.value + '</a>' +
            (hit.url ? (' (' + hit._highlightResult.url.value + ')') : '') + '</div>';
          res += '    <div class="url"><a href="' + item_url + '" target="_blank">' + item_url + '</a> ' +
          '<span class="author">by <a href="https://news.ycombinator.com/user?id=' + hit.author + '" target="_blank">' + hit._highlightResult.author.value + '</a></span></div>';
          if (hit.story_text) {
            res += '    <div class="story_text">' + hit._highlightResult.story_text.value.replace(/(\\r)?\\n/g, '<br />').replace(/<em>(a|an|s|is|and|are|as|at|be|but|by|for|if|in|into|is|it|no|not|of|on|or|such|the|that|their|then|there|these|they|this|to|was|will|with)<\/em>/ig, '$1') + '</div>';
          }
          res += '  </div>' +
            '  <div class="clearfix"></div>';
        } else if (type === 'comment') {
          if (hit.story_id) {
            res += '  <div class="thumb pull-left hidden-xs"><img src="//drcs9k8uelb9s.cloudfront.net/' + hit.story_id + '.png" /></div>';
            res += '  <div class="title_url">';
          }
          if (hit.story_title) {
            if (hit.story_url) {
              res += ' <div class="title"><a href="' + hit.story_url + '" target="_blank">' + hit._highlightResult.story_title.value + '</a> (' + hit._highlightResult.story_url.value + ')</div>';
            } else {
              res += ' <div class="title">' + hit._highlightResult.story_title.value + '</div>';
            }
          }
          res += '  <div class="url">';
          res += '    <a href="' + item_url + (hit.story_id ?  '#up_' + hit.objectID : '') + '" target="_blank">' + item_url + '</a>';
          res += '    <span class="author">by <a href="https://news.ycombinator.com/user?id=' + hit.author + '" target="_blank">' + hit._highlightResult.author.value + '</a></span>';
          res += '  </div>';
          res += '  <div class="comment_text">' + hit._highlightResult.comment_text.value.replace(/(\\r)?\\n/g, '<br />').replace(/<em>(a|an|s|is|and|are|as|at|be|but|by|for|if|in|into|is|it|no|not|of|on|or|such|the|that|their|then|there|these|they|this|to|was|will|with)<\/em>/ig, '$1') + '</div>';
          if (hit.story_id) {
            res += '  </div>';
          }
          res += '  <div class="clearfix"></div>';
        }
        res += '  <div class="points pull-left"><b>' + hit.points + '</b> point' + (hit.points > 1 ? 's' : '') + '</div>';
        if (type === 'story') {
          res += '  <div class="comments pull-left"><a href="https://news.ycombinator.com/item?id=' + hit.objectID + '" target="_blank">' + hit.num_comments + ' comment' + (hit.num_comments > 1 ? 's' : '') + '</a></div>';
        }
        res += '  <div class="created_at pull-left"><abbr class="timeago" title=' + new Date(hit.created_at_i * 1000).toISOString() + '></abbr></div>';
        res += '  <div class="clearfix"></div>' +
          '</div>';
      }
      this.$hits.html(res);
      $('#hits .timeago').timeago();

      // pagination
      var pagination = '';
      if (content.nbHits > 0) {
        pagination += '<ul class="pagination">';
        pagination += '<li class="' + (content.page == 0 ? 'disabled' : '') + '"><a href="javascript:window.hnsearch.previousPage()">«</a></li>';
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
        pagination += '<li class="' + (content.page >= content.nbPages - 1 ? 'disabled' : '') + '"><a href="javascript:window.hnsearch.nextPage()">»</a></li>';
        pagination += '</ul>';
      }
      this.$pagination.html(pagination);
    },

    previousPage: function() {
      this.gotoPage(this.page - 1);
    },

    nextPage: function() {
      this.gotoPage(this.page + 1);
    },

    gotoPage: function(page) {
      $('html, body').scrollTop(0);
      this.search(page);
    }

  }
})(jQuery);
