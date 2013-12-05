// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require bootstrap
//= require turbolinks
//= require_tree .

(function($) {
  window.HNSearch = function(applicationID, apiKey, indexName) {
    this.init(applicationID, apiKey, indexName);
  }

  HNSearch.prototype = {
    init: function(applicationID, apiKey, indexName) {
      var self = this;

      this.idx = new AlgoliaSearch(applicationID, apiKey).initIndex(indexName);
      this.$hits = $('#hits');
      this.page = 0;
      this.currentHit = null;

      $(window).scroll(function () {
        if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
          self.search(self.page + 1);
        }
      });

      $('#inputfield input').keyup(function(e) {
        switch (e.keyCode) {
          case 13: return self.goCurrent();
          case 27: $('#inputfield input').val(''); break;
          case 37: return self.goLeft();
          case 38: return self.goUp();
          case 39: return self.goRight();
          case 40: return self.goDown();
          default: break;
        }
        self.page = 0;
        self.currentHit = null;
        self.search(0);
      }).focus();

      // resolve DNS
      this.idx.search('', function(success, content) { });
    },

    search: function(p) {
      if ((this.page > 0 && p <= this.page) || this.page > 50) {
        // hard limit
        return;
      }

      var query = $('#inputfield input').val().trim();
      if (query.length == 0) {
        this.$hits.empty();
        return;
      }

      var self = this;
      this.idx.search(query, function(success, content) { self.searchCallback(success, content); }, { hitsPerPage: 25, page: p, getRankingInfo: 1 });
    },

    goLeft: function() {
    },

    goRight: function() {
    },

    goDown: function() {
      if (!this.go('next')) {
        this.search(this.page + 1);
      }
    },

    goUp: function() {
      if (!this.go('prev')) {
        this.currentHit.removeClass('active');
        this.currentHit = null;
      }
    },

    goCurrent: function() {
      if (!this.currentHit) return;
      window.location.href = 'http://news.ycombinator.com/item?id=' + this.currentHit.data('id');
    },

    go: function(selectFunction) {
      if (!this.currentHit) {
        this.currentHit = $(this.$hits.children('.hit:first-child')[0]);
      } else {
        var next = this.currentHit[selectFunction]();
        if (next.length == 0) {
          return false;
        }  
        this.currentHit.removeClass('active');
        this.currentHit = next;
      }      
      this.currentHit.addClass('active');
      var target = this.currentHit.offset().top - this.$hits.offset().top;
      $('html, body').scrollTop(target);
      return true;
    },

    searchCallback: function(success, content) {
      if (!success) {
        console.log(content);
        return;
      }

      if (content.query.trim() != $('#inputfield input').val().trim()) {
        return;
      }
      if (this.page != 0 && this.page >= content.page) {
        return;
      }
      this.page = content.page;
      var res = '';
      for (var i = 0; i < content.hits.length; ++i) {
        var hit = content.hits[i];
        var type = hit._tags[0]; // first tag stores the item type

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
        if (hit.points > 1000) {
          classes.push('p1000');
        } else if (hit.points > 500) {
          classes.push('p500');
        } else if (hit.points > 250) {
          classes.push('p250');
        } else if (hit.points > 100) {
          classes.push('p100');
        }

        // content
        res +=  '<div class="' + classes.join(' ') + '" data-id="' + hit.objectID + '">' +
          '  <div class="author text-right"><a href="https://news.ycombinator.com/user?id=' + hit.author + '" target="_blank">' + hit._highlightResult.author.value + '</a></div>';
        if (type === 'story') {
          res += '  <div class="thumb pull-left"><img src="//drcs9k8uelb9s.cloudfront.net/' + hit.objectID + '.png" /></div>' +
            '  <div class="title_url">' +
            '    <div class="title">' + hit._highlightResult.title.value + '</div>' +
            '    <div class="url"><a href="' + hit.url + '" target="_blank">' + hit._highlightResult.url.value + '</a></div>' +
            '  </div>' +
            '  <div class="clearfix"></div>';
          if (hit.url) {
            var a = $('<a>', { href: hit.url } )[0];
            res += '  <div class="source pull-right">' + a.hostname + '</div>';
          }
        } else if (type === 'comment') {
          if (hit.story_id) {
            res += '  <div class="thumb pull-left"><img src="//drcs9k8uelb9s.cloudfront.net/' + hit.story_id + '.png" /></div>';
            res += '  <div class="title_url">';
          }
          if (hit.story_title) {
            res += '  <div class="title">' + hit.story_title + '</div>';
          }
          res += '  <div class="url">';
          var item_url = 'https://news.ycombinator.com?item=' + (hit.story_id ? hit.story_id : hit.objectID);
          res += '    <a href="' + item_url + '" target="_blank">' + item_url + '</a>';
          if (hit.story_url) {
            res += '(<a href="' + hit.story_url + '" target="_blank">' + hit.story_url + '</a>)';
          }
          res += '  </div>';
          res += '  <div class="comment_text">' + hit._highlightResult.comment_text.value + '</div>';
          if (hit.story_id) {
            res += '  </div>';
          }
          res += '  <div class="clearfix"></div>';
        }
        res += '  <div class="created_at pull-right"><abbr class="timeago" title=' + hit.created_at + '></abbr></div>' +
          '  <div class="points pull-left"><b>' + hit.points + '</b> point' + (hit.points > 1 ? 's' : '') + '</div>';
        if (type === 'story') {
          res += '  <div class="comments pull-left"><a href="https://news.ycombinator.com/item?id=' + hit.hn_id + '" target="_blank">' + hit.num_comments + ' comment' + (hit.num_comments > 1 ? 's' : '') + '</a></div>';
        }
        res += '  <div class="clearfix"></div>' +
          '</div>';
      }
      if (content.page === 0) {
        this.$hits.html(res);
      } else {
        this.$hits.append(res);
      }
      $('#hits .timeago').timeago();
    }

  }
})(jQuery);

