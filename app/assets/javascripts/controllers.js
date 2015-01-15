angular.module('HNSearch.controllers', ['ngSanitize', 'ngDropdowns', 'pasvaz.bindonce'])

.run(['settings', function(settings) {
  $('body').attr('rel', settings.get().style);
}])

.controller('SearchCtrl', ['$scope', '$location', '$http', '$stateParams', '$sce', 'search', 'settings', 'hot', 'starred', 'Analytics', function($scope, $location, $http, $stateParams, $sce, search, settings, hot, starred, Analytics) {
  // Init search et params
  $scope.query = search.query;
  $scope.state = '';
  $scope.settings = settings.get();
  $scope.results = null;
  $scope.story = {};
  $scope.placeholder = '';

  var getIndex = function(q) {
    if ($scope.settings.sort === 'byDate') {
      return settings.indexSortedByDate;
    } else if (q.length <= 2) {
      return settings.indexSortedByPopularityOrdered;
    } else {
      return settings.indexSortedByPopularity;
    }
  };

  var parseQuery = function(query, params) {
    params.tagFilters = params.tagFilters || [];
    params.numericFilters = params.numericFilters || [];

    // authors:pg (ORed)
    var authors = [];
    while (true) {
      var matches = query.match(/(author|by):([^ ]+)/);
      if (!matches) {
        break;
      }
      if (matches.length > 0) {
        authors.push(matches[2]);
        query = query.replace(matches[1] + ':' + matches[2], '');
      }
    }
    if (authors.length > 0) {
      var tags = [];
      for (var i = 0; i < authors.length; ++i) {
        tags.push('author_' + authors[i]);
      }
      params.tagFilters.push(tags);
    }

    // points>42 (ANDed)
    while (true) {
      var matches = query.match(/points(=|:|<|>|<=|>=)([0-9]+)/);
      if (!matches) {
        break;
      }
      if (matches.length > 0) {
        params.numericFilters.push('points' + matches[1] + matches[2]);
        query = query.replace('points' + matches[1] + matches[2], '');
      }
    }

    // date>1395440948 (ANDed)
    while (true) {
      var matches = query.match(/date(=|:|<|>|<=|>=)([0-9]+)/);
      if (!matches) {
        break;
      }
      if (matches.length > 0) {
        params.numericFilters.push('created_at_i' + matches[1] + matches[2]);
        query = query.replace('date' + matches[1] + matches[2], '');
      }
    }

    // story:ID (ORed)
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
      params.tagFilters.push(tags);
    }

    return { query: query, params: params };
  };

  //Search scope
  $scope.getSearch = function(noProgres) {
    if (!noProgres) {
      NProgress.start();
    }
    var _search = function(ids) {
      var parsedQuery = parseQuery(search.query, search.getParams(ids));
      getIndex(parsedQuery.query).search(parsedQuery.query, undefined, parsedQuery.params).then(function(results) {
        if (parsedQuery.query === results.query) {
          $scope.results = results;
        }
        if (!noProgres) {
          NProgress.done();
        }
      });
    };
    $scope.query = search.query;

    if ($scope.state === 'hot') {
      $scope.results = null;
      hot.get().then(function(ids) {
        _search(ids);
      });
    } else if ($scope.state === 'starred') {
      _search(starred.all());
    } else if (search.storyID) {
      $scope.loadComments(search.storyID);
      _search([ search.storyID ]);
      search.storyID = null;
    } else {
      _search();
    }
  };

  $scope.loadComments = function(id, $event) {
    if ($event) {
      $event.preventDefault();
    }

    $('.item-show-comments').removeClass('item-show-comments');

    // reset previous comments
    var s = $scope.story[id];
    $scope.story = {};
    if (s) {
      return;
    }

    if ($scope.results) {
      var found = false;
      for (var i = 0; i < $scope.results.hits.length; ++i) {
        if ($scope.results.hits[i].objectID == id) {
          found = true;
          break;
        }
      }
      if (!found) {
        return;
      }
    }

    NProgress.start();
    $http.get($location.protocol() + '://hn.algolia.com/api/v1/items/' + id).success(function(data) {
      NProgress.done();

      $scope.story[id] = { comments: data };

      var item = $event ? $($event.currentTarget).closest('.item') : $('.item_' + id);
      item.addClass('item-show-comments');
      $(window).scrollTop(item.offset().top - $('.page-header').outerHeight() - $('.main > header').outerHeight());
    });
  };

  $scope.sortBy = function(order) {
    $scope.settings.page = 0;
    $scope.settings.sort = order;
  };

  $scope.selectDate = function(date) {
    $scope.settings.dateRange = date;
    if (date === 'custom') {
      $scope.settings.dateStart = $scope.settings.dateEnd = null;
    }
  };

  $scope.pageTitle = function() {
    switch ($scope.state) {
    case undefined: case '': return $scope.settings.style === 'default' ? '' : 'All';
    case "ask-hn": return "Ask HN";
    case "show-hn": return "Show HN";
    case "jobs": return "Jobs";
    case "polls": return "Polls";
    case "hot": return "Hot";
    case "starred": return "Starred";
    case "user": return $scope.settings.login;
    default: return "HN Search";
    }
  }

  $scope.toggleStar = function($event, id) {
    $event.preventDefault();
    starred.toggle(id);
    // stupid animation
    var target = $('.sidebar .icon-star');
    var elementToDrag = $($event.currentTarget).not('.starred').find('.icon-star').eq(0);
    if ( elementToDrag.length != 0 ) {
      var clone = elementToDrag
        .clone()
        .offset({
          top: elementToDrag.offset().top,
          left: elementToDrag.offset().left
        })
        .css({
          'opacity': '0.8',
          'position': 'absolute',
          'z-index': '100',
          'color': '#FF742B'
        })
        .appendTo($('body'))
        .animate({
          'top': target.offset().top + 0,
          'left': target.offset().left + 0,
          'width': 75,
          'height': 75
        }, 700, 'linear');

      clone.animate({
        'width': 0,
        'height': 0
      }, function () {
        $(this).detach();
      });
    }
  };

  $scope.isStarred = function(id) {
    return starred.is(id);
  };

  //Dropdowns
  //https://github.com/jseppi/angular-dropdowns
  var getSelectOption = function(options, selected) {
    for (var i = 0; i < options.length; ++i) {
      if (options[i].value === selected) {
        return angular.copy(options[i]);
      }
    }
    return null;
  };
  $scope.ddSelectType = [
    {
      text: 'All',
      value: 'all',
    }, {
      text: 'Stories',
      value: 'story'
    }, {
      text: 'Comments',
      value: 'comment'
    }
  ];
  $scope.ddSelectSort = [
    {
      text: 'Popularity',
      value: 'byPopularity',
    }, {
      text: 'Date',
      value: 'byDate'
    }
  ];
  $scope.ddSelectDate = [
    {
      text: 'All time',
      value: 'all'
    },
    {
      text: 'Last 24h',
      value: 'last24h',
    }, {
      text: 'Past Week',
      value: 'pastWeek'
    }, {
      text: 'Past Month',
      value: 'pastMonth'
    }, {
      text: 'Custom range',
      value: 'custom'
    }
  ];

  $scope.ddDateSelected = getSelectOption($scope.ddSelectDate, $scope.settings.dateRange) || getSelectOption($scope.ddSelectDate, 'all');
  $scope.ddSortSelected = getSelectOption($scope.ddSelectSort, $scope.settings.sort) || getSelectOption($scope.ddSelectSort, 'byPopularity');
  $scope.ddTypeSelected = getSelectOption($scope.ddSelectType, $scope.settings.type) || getSelectOption($scope.ddSelectType, 'all');

  $scope.selectType = function(selected) {
    $scope.settings.type = selected.value;
  };

  $scope.selectInput = function($event) {
    $event.preventDefault();
    $('.page-header input[type="search"]').select();
  };

  $scope.widerDateRange = function($event) {
    $event.preventDefault();
    $scope.settings.dateRange = 'all';
  };

  $scope.searchAllItems = function($event) {
    $event.preventDefault();
    $scope.settings.type = 'all';
    $scope.ddTypeSelected = angular.copy($scope.ddSelectType[0]);
  };

  // Share item
  $scope.ddMenuShare = [
    {
      text: 'Share on Twitter',
      icon: 'icon-twitter',
      share: 'twitter'
    }, {
      text: 'Share on Facebook',
      icon: 'icon-facebook',
      share: 'facebook'
    }, {
      text: 'Share by Email',
      icon: 'icon-envelope-o',
      share: 'email'
    }
  ];
  $scope.shareItem = function(selected, hit) {
    var url = hit ? $location.protocol() + '://' + $location.host() + "/story/" + hit.objectID + "/" + $scope.friendly(hit.title) : window.location.href;
    var title = (hit ? hit.title + ' - ' : ($scope.query ? 'I just searched for "' + $scope.query + '" on Hacker News - ' : '')) + 'Hacker News Search';
    switch (selected.share){
      case 'twitter':
        window.open("https://twitter.com/share?url=" + escape(url) + "&text=" + title, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
        break;
      case 'facebook':
        window.open("https://www.facebook.com/sharer/sharer.php?u=" + escape(url) + "&t=" + title, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
        break;
      case 'email':
        window.location.href = "mailto:?subject=" + title + "&body=" + url;
        break;
    }
  };

  // Pagination
  $scope.nextPage = function() {
    $scope.toPage($scope.settings.page + 1);
  };
  $scope.prevPage = function() {
    if ($scope.settings.page > 0) {
      $scope.toPage($scope.settings.page - 1);
    }
  };
  $scope.toPage = function(page) {
    $scope.settings.page = page;
  };
  $scope.getPages = function(results) {
    var pages = [];
    var min;
    if ($scope.settings.page > 5) {
      pages.push(0);
      pages.push('...');
      min = 0;
    } else {
      for (var i = 0; i < $scope.settings.page + 5 && i < results.nbPages; ++i) {
        pages.push(i);
        min = i;
      }
    }
    for (var i = $scope.settings.page - 5; i < $scope.settings.page + 5; ++i) {
      if (i >= 0 && i < results.nbPages && i > min && i < results.nbPages) {
        pages.push(i);
      }
    }
    if ($scope.settings.page < results.nbPages - 5) {
      pages.push('...');
      pages.push(results.nbPages - 1);
    }
    return pages;
  };

  $scope.gotoMenu = function($event, path) {
    $event.preventDefault();
    $scope.story = {};
    $location.path(path).search($location.search());
    window.scrollTo(0, 0);
    if( $('.sidebar').hasClass('is-visible')){
      $scope.toggleNav();
    }
  };

  $scope.friendly = function(v) {
    return v && $.friendly_id(v);
  }

  $scope.getURL = function() {
    return location.href;
  };

  // Watch settings
  $scope.$watchCollection('settings', function(newSettings, oldSettings) {
    if (newSettings.page == oldSettings.page) {
      $scope.settings.page = 0;
    }

    if (newSettings.type === 'all') {
      $scope.placeholder = 'Stories, polls, jobs, comments';
    } else if (newSettings.type === 'story') {
      $scope.placeholder = 'Search stories by title, url or author';
    } else if (newSettings.type === 'comment') {
      $scope.placeholder = 'Search comments';
    }

    $scope.ddTypeSelected = getSelectOption($scope.ddSelectType, newSettings.type);
    $scope.ddSortSelected = getSelectOption($scope.ddSelectSort, newSettings.sort);
    $scope.ddDateSelected = getSelectOption($scope.ddSelectDate, newSettings.dateRange);
    if (newSettings.dateRange === 'custom' && newSettings.dateStart && newSettings.dateEnd) {
      $scope.ddDateSelected.text = moment(newSettings.dateStart * 1000).format("MMM Do YYYY") + ' » ' + moment(newSettings.dateEnd * 1000).format("MMM Do YYYY");
    }

    window.scrollTo(0, 0);
    search.applySettings(newSettings, $scope.state);
    $scope.getSearch();
    Analytics.trackPage('/' + location.href.split('/').slice(3).join('/'));
  });

  // Watch query
  $scope.$watch('query', function (newValue, oldValue) {
    if(newValue === oldValue || typeof newValue === 'undefined') {
      return;
    }
    $scope.settings.page = 0;
    search.query = newValue;
    $scope.getSearch(true);
  });
  $scope.reset = function() {
    search.query = $scope.query = '';
    settings.reset();
  };

  // Watch+Handle page change
  //  -> if on "starred", backup the settings & use byDate/all/<empty>
  $scope.savedSettings = null;
  $scope.savedQuery = null;
  var first = true;
  $scope.$watch('state', function() {
    if ($scope.state === 'starred') {
      if (!$scope.savedSettings) {
        $scope.savedSettings = angular.copy($scope.settings);
      }
      $scope.settings.sort = 'byDate';
      $scope.settings.dateRange = 'all';
      $scope.settings.type = 'story';
      if (!$scope.savedQuery) {
        $scope.savedQuery = $scope.query;
      }
      $scope.query = search.query = '';
    } else {
      if ($scope.savedSettings) {
        $scope.settings = $scope.savedSettings;
        $scope.savedSettings = null;
      }
      if ($scope.savedQuery) {
        $scope.query = search.query = $scope.savedQuery;
        $scope.savedQuery = null;
      }
    }
    if (!first) {
      search.applySettings($scope.settings, $scope.state);
      $scope.getSearch();
    }
    first = false;
  });
  $scope.$on("$stateChangeSuccess", function(event, toState, toParams) {
    $scope.state = toParams.page;
    window.scrollTo(0, 0);
  });

  $scope.setQuery = function($event, q) {
    $event.preventDefault();
    search.query = $scope.query = q;
  };

  $scope.populars = [];
  $http.get('/popular.json').then(function(results) {
    $scope.populars = results.data;
  });

  // Handle history
  $scope.$watch(function () { return $location.search(); }, function() {
    $scope.settings = settings.reload();
    $scope.settings.page = 0;
  });

  if ($location.search().experimental) {
    $scope.settings.style = 'experimental';
  }

  //navigation
  $scope.toggleNav = function(){
    //sliding menu
    $('.sidebar, .sliding-menu-fade-screen').toggleClass('is-visible');
  }


  // calendar
  $('.daterangepicker-days').daterangepicker();
}])

.controller('StoryCtrl', ['$scope', '$stateParams', 'search', function($scope, $stateParams, search) {
  search.storyID = $stateParams.id;
}])

.controller('SettingsCtrl', ['$scope', 'settings', function($scope, settings) {
  $scope.isSettings = true;
  $scope.settings = settings.get();
  window.scrollTo(0, 0);

  var first = true;
  $scope.$watchCollection('settings', function(oldSettings, newSettings) {
    if (!first) {
      settings.save();
    }
    first = false;
  });
}])

.controller('HeadCtrl', ['$scope', 'settings', function($scope, settings) {
  $scope.settings = settings.get();
}])

.directive('collection', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      collection: "="
    },
    template: "<ul ng-show='collection.length>0' class='replies-list'><reply ng-repeat='reply in collection' reply='reply'></reply></ul>"
  };
})

.directive('reply', ['$compile', function($compile) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      reply: "="
    },
    link: function (scope, element, attrs) {
      var collectionSt = '<collection collection="reply.children"></collection>';
      if (angular.isArray(scope.reply.children)) {
        $compile(collectionSt)(scope, function(cloned, scope)   {
          element.append(cloned);
        });
      }
    },
    template: '<li>' +
                '<span class="author"><avatar author="reply.author"></avatar> {{reply.author || "deleted"}}</span><span ng-if="reply.created_at"> - <a class="date" ng-href="https://news.ycombinator.com/item?id={{reply.story_id}}#up_{{reply.id}}" title="{{ reply.created_at }}">{{reply.created_at_i | moment:"M/D/YYYY h:m A"}}</a></span>' +
                '<div class="reply-container" ng-bind-html="reply.text|cleanup"></div>' +
              '</li>'
  };
}])

.directive('hnsearch', ['search', 'settings', '$location', function(search, settings, $location) {
  return {
    restrict: 'E',
    replace: true,
    scope: false,
    link: function(scope, element, attrs) {
      if (attrs.class) {
        element.addClass(attrs.class);
      }

      scope.blurred = function() {
        $location.search('query', scope.query);
      };

      scope.keyup = function($event) {
        if ($event.keyCode === 13) {
          settings.get().prefix = false;
        } else {
          settings.get().prefix = true;
        }
      };

      var input = $($(element).find('input')[0]);
      input.tagautocomplete({
        character: '(author|by):',
        source: function(query, process) {
          var tquery = this.extractor();
          if(!tquery) {
            return [];
          }
          var author = tquery.substring(tquery.indexOf(':') + 1);
          settings.indexUser.search(author, function(success, content) {
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
    },
    template: '<div class="item-input-wrapper">' +
                '<i class="icon-search"></i>' +
                '<input type="search" placeholder="{{ $parent.placeholder }}" ng-model="$parent.query" ng-model-options="{debounce: 100}" ng-blur="blurred()" ng-keyup="keyup($event)" autofocus>' +
              '</div>'
  };
}])

.directive('avatar', [function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      author: "="
    },
    template: '<span>' +
        '<span ng-if="!author" class="icon-circle-cross"></span>' +
        '<span ng-if="author" class="item-avatar" style="background-color:{{author|color}}">{{author|firstLetter}}</span>' +
      '</span>'
  };
}])


.directive('activeLink', ['$location', function(location) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs, controller) {
      var path = attrs.href;
      scope.location = location;
      scope.$watch('location.path()', function(newPath) {
        if (path === newPath || (path === '/' && !newPath) || (newPath === '/' && !path)) {
          element.addClass('active');
        } else {
          element.removeClass('active');
        }
      });
    }
  };
}])

// image preload
.directive('imgPreload', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    scope: {
      ngSrc: '@'
    },
    link: function(scope, element, attrs) {
      var loaded = false;
      element.on('load', function() {
        loaded = true;
        element.addClass('in');
      }).on('error', function() {
        //
      });
      $timeout(function() {
        if (!loaded) {
          element.addClass('fade')
        }
      }, 10); // is 10ms to detect the image was in the cache?
    }
  };
}])

.directive('dateRangePicker', ['$timeout', 'settings', function($timeout, settings) {
  return {
    link: function ($scope, element, attrs) {
      $scope.cancel = function() {
        var s = settings.get();
        s.dateRange = 'all';
        s.dateStart = s.dateEnd = null;
      };

      $timeout(function () {
        $(element).find('#date-start').on('change', function(e) {
          var v = $(this).val();
          $scope.$apply(function() {
            settings.get().dateStart = Date.parse(v) / 1000;
          });
        });
        $(element).find('#date-end').on('change', function(e) {
          var v = $(this).val();
          $scope.$apply(function() {
            settings.get().dateEnd = Date.parse(v) / 1000 + 60*60*24;
          });
        });
        $(element).find('.datepicker1').daterangepicker({
          weekStart: 1
        });
      }, 0, false);
    }
  };
}])

// sticky
.directive('stickyList', function() {
  return {
    link: function(scope, element, attrs) {
      // Store list element.
      var $list = $(element);

      // When window scrolls.
      var $pageHeader = $('.page-header');
      var $mainHeader = $('.main > header');
      $(window).scroll(function() {
        // Unstick unselected headers which are are still sticky.
        $('.item.item-fixed:not(.item-show-comments), .item.item-absolute-bottom:not(.item-show-comments)')
          .removeClass('item-fixed')
          .removeClass('item-absolute-bottom')
          .data('stickyOriginalTop', '')
          .css('padding-top', 0);

        // Skip if no header is selected.
        var $header = $('.item.item-show-comments', $list);
        if ($header.length === 0) {
          return;
        }

        // Store original header top.
        if (!$header.data('stickyOriginalTop')) {
          var stickyOriginalTop = $header.offset().top - $pageHeader.outerHeight() - $mainHeader.outerHeight();
          $header.data('stickyOriginalTop', stickyOriginalTop);
        }

        // Get positions.
        var scrollTop = $(this).scrollTop();
        var headerTop = $header.data('stickyOriginalTop');
        var bodyBottom = $header.next().offset().top - $header.find('.item-main').outerHeight() - $pageHeader.outerHeight() - $mainHeader.outerHeight();

        // Stick/unstick header.
        if (scrollTop > headerTop && scrollTop < bodyBottom && !$header.data('stickyStarted')) {
          $header.addClass('item-fixed').removeClass('item-absolute-bottom').data('stickyStarted', 'yes');
        }
        if (scrollTop < headerTop && $header.data('stickyStarted')) {
          $header.removeClass('item-fixed').data('stickyStarted', '');
        }
        if (scrollTop > bodyBottom && $header.data('stickyStarted')) {
          $header.removeClass('item-fixed').addClass('item-absolute-bottom').data('stickyStarted', '');
        }
        if (!$header.hasClass('item-fixed') && !$header.hasClass('item-absolute-bottom')) {
          $header.data('stickyOriginalTop', '').css('padding-top', 0);
        } else {
          $header.css('padding-top', $header.find('.item-main').outerHeight() + 'px');
        }
      });
    }
  }
})

.directive('stickyList', function() {
  return {
    link: function(scope, element, attrs) {
      // Store list element.
      var $list = $(element);

      // When window scrolls.
      var $pageHeader = $('.page-header');
      var $mainHeader = $('.main > header');
      $(window).scroll(function() {
        // Unstick unselected headers which are are still sticky.
        $('.item.item-fixed:not(.item-show-comments), .item.item-absolute-bottom:not(.item-show-comments)')
          .removeClass('item-fixed')
          .removeClass('item-absolute-bottom')
          .data('stickyOriginalTop', '')
          .css('padding-top', 0);

        // Skip if no header is selected.
        var $header = $('.item.item-show-comments', $list);
        if ($header.length === 0) {
          return;
        }

        // Store original header top.
        if (!$header.data('stickyOriginalTop')) {
          var stickyOriginalTop = $header.offset().top - $pageHeader.outerHeight() - $mainHeader.outerHeight();
          $header.data('stickyOriginalTop', stickyOriginalTop);
        }

        // Get positions.
        var scrollTop = $(this).scrollTop();
        var headerTop = $header.data('stickyOriginalTop');
        var bodyBottom = $header.next().offset().top - $header.find('.item-main').outerHeight() - $pageHeader.outerHeight() - $mainHeader.outerHeight();

        // Stick/unstick header.
        if (scrollTop > headerTop && scrollTop < bodyBottom && !$header.data('stickyStarted')) {
          $header.addClass('item-fixed').removeClass('item-absolute-bottom').data('stickyStarted', 'yes');
        }
        if (scrollTop < headerTop && $header.data('stickyStarted')) {
          $header.removeClass('item-fixed').data('stickyStarted', '');
        }
        if (scrollTop > bodyBottom && $header.data('stickyStarted')) {
          $header.removeClass('item-fixed').addClass('item-absolute-bottom').data('stickyStarted', '');
        }
        if (!$header.hasClass('item-fixed') && !$header.hasClass('item-absolute-bottom')) {
          $header.data('stickyOriginalTop', '').css('padding-top', 0);
        } else {
          $header.css('padding-top', $header.find('.item-main').outerHeight() + 'px');
        }
      });
    }
  }
})

.directive("deferShareDropdown", ['$compile', function($compile) {
  function compile(tElement, tAttributes) {
    var tOverlay = tElement.find("a.dropwdown-share").remove();
    var transcludeOverlay = $compile(tOverlay);
    function link($scope, element, attributes) {
      element.on("mouseover", "a.placeholder i.icon-share",
        function(event) {
          var item = $(this).closest('li');
          $(this).remove();
          var localScope = item.scope();
          if (localScope.hasOwnProperty("__injected") ) {
            return;
          }
          transcludeOverlay(
            localScope,
            function( overlayClone, $scope ) {
              item.append(overlayClone);
              $scope.__injected = true;
            }
          );
          localScope.$apply();
        }
      );
    }
    return( link );
  }
  return({compile: compile});
}])


;
