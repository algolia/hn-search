angular.module('HNSearch.controllers', ['ngSanitize'])

.controller('SearchCtrl', ['$scope', '$location', '$http', '$stateParams', '$sce', 'search', 'settings', 'hot', 'starred', function($scope, $location, $http, $stateParams, $sce, search, settings, hot, starred) {
  // Init search et params
  $scope.state = '';
  $scope.settings = settings.get();
  $scope.results = null;
  $scope.story = {};

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
  $scope.getSearch = function(withComments) {
    NProgress.start();
    var _search = function(ids) {
      var parsedQuery = parseQuery(search.query, search.getParams(ids));
      getIndex(parsedQuery.query).search(parsedQuery.query, undefined, parsedQuery.params).then(function(results) {
        $scope.results = results;
        NProgress.done();
        if (withComments) {
          for (var i = 0; i < $scope.settings.loadedComments.length; ++i) {
            $scope.loadComments($scope.settings.loadedComments[i]);
          }
        }
      });
    };
    $scope.query = search.query;

    if ($scope.state === 'hot') {
      hot.get().then(function(ids) {
        _search(ids);
      });
    } else if ($scope.state === 'starred') {
      _search(starred.all());
    } else {
      _search();
    }
  };

  $scope.loadComments = function(id, $event) {

    NProgress.start();

    if ($event) {
      settings.loadComments(id);
      $event.preventDefault();
    }

    var found = false;
    for (var i = 0; i < $scope.results.hits.length; ++i) {
      if ($scope.results.hits[i].objectID == id) {
        found = true;
        break;
      }
    }
    if (!found) return;

    $http.get('https://hn.algolia.com/api/v1/items/' + id).success(function(data) {

      NProgress.done();

      $scope.story[id] = { comments: data };

      var item;
      if ($event) {
        item = $($event.currentTarget).closest('.item');
      } else {
        item = $('.item_' + id)[0];
      }
      if (!item || !item.position) {
        return;
      }
      item.addClass('item-show-comments');

      var itemHeight = 95;
      var itemMarginBorder = 23; //WTF
      var wrap = $(window);

      var firstStick = false;
      var startStickPosition = item.position().top - itemHeight + itemMarginBorder;
      var endStickPosition;
      //DRAFT
      wrap.on("scroll", function(e) {

        if (typeof endStickPosition === 'undefined') {
          endStickPosition = item.next().position().top - 2 * itemHeight + itemMarginBorder;
          //console.log('endStickPosition');
        }

        if (wrap.scrollTop() > startStickPosition && wrap.scrollTop() < endStickPosition && firstStick === false) {
          item.addClass("item-fixed");
          item.removeClass('item-absolute-bottom');
          firstStick = 'start';
        }
        if (wrap.scrollTop() < startStickPosition && firstStick === 'start') {
          item.removeClass("item-fixed");
          firstStick = false;
        }
        if (wrap.scrollTop() > endStickPosition && firstStick === 'start') {
          item.removeClass("item-fixed");
          item.addClass('item-absolute-bottom');
          firstStick = false;
        }
      });

    });
  };

  $scope.sortBy = function(order) {
    $scope.settings.page = 0;
    $scope.settings.sort = order;
  };

  $scope.pageTitle = function() {
    switch ($scope.state) {
    case undefined: case '': return 'All';
    case "ask-hn": return "Ask HN";
    case "show-hn": return "Show HN";
    case "jobs": return "Jobs";
    case "polls": return "Polls";
    case "hot": return "Hot";
    case "starred": return "Starred";
    default: return "HN Search";
    }
  }

  $scope.toggleStar = function($event, id) {
    $event.preventDefault();
    starred.toggle(id);
  };

  $scope.isStarred = function(id) {
    return starred.is(id);
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
    window.scrollTo(0, 0);
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

    $location.path(path).search($location.search());
    window.scrollTo(0, 0);
  };

  // Watch settings
  $scope.$watchCollection('settings', function(newSettings, oldSettings) {
    if (newSettings.page == oldSettings.page) {
      $scope.page = 0;
    }
    search.applySettings(newSettings, $scope.state);
    $scope.getSearch();
  });

  // Watch+Handle page change
  $scope.$watch('state', function() {
    settings.reload();
  });
  $scope.$on("$stateChangeSuccess", function(event, toState, toParams) {
    $scope.state = toParams.page;
    window.scrollTo(0, 0);
  });

  // run 1st query
  search.applySettings($scope.settings, $scope.state);
  $scope.getSearch(true);
}])

.controller('SettingsCtrl', ['$scope', 'settings', function($scope, settings) {
  $scope.isSettings = true;
  $scope.settings = settings.get();

  $scope.$watchCollection('settings', function(oldSettings, newSettings) {
    settings.save();
  });
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
                '<span class="author"><avatar author="reply.author"></avatar> {{reply.author}}</span> - <a class="date" ng-href="https://news.ycombinator.com/item?id={{reply.story_id}}#up_{{reply.id}}">{{reply.created_at_i | moment:"M/D/YYYY h:m A"}}</a>' +
                '<div class="reply-container" ng-bind-html="reply.text|cleanup"></div>' +
              '</li>'
  };
}])

.directive('hnsearch', ['search', 'settings', '$location', function(search, settings, $location) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      getData: '&source',
      model: '=?'
    },
    link: function(scope, element, attrs) {
      attrs.minLength = attrs.minLength || 0;
      scope.placeholder = attrs.placeholder || '';
      scope.query = search.query;

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

      scope.$watch('query', function (newValue, oldValue) {
        if(newValue === oldValue || typeof newValue === 'undefined') {
          return;
        }
        settings.get().page = 0;
        search.query = scope.query;
        scope.getData();
      });

    },
    template: '<div class="item-input-wrapper">' +
                '<i ng-hide="query" class="icon-search"></i>' +
                '<input type="search" placeholder="{{placeholder}}" ng-model="query" ng-blur="blurred()" ng-keyup="keyup($event)">' +
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
    template: '<span class="item-avatar" style="background-color:{{author|color}}">{{author|firstLetter}}</span>'
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
.directive('imgPreload', ['$rootScope', function($rootScope) {
  return {
    restrict: 'A',
    scope: {
      ngSrc: '@'
    },
    link: function(scope, element, attrs) {
      element.addClass('fade');
      element.on('load', function() {
        element.addClass('in');
      }).on('error', function() {
        //
      });
      scope.$watch('ngSrc', function(newVal) {
        element.removeClass('in');
      });
    }
  };
}])


;
