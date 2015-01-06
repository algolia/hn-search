angular.module('HNSearch.controllers', ['ngSanitize'])

.controller('SearchCtrl', ['$scope', '$location', '$http', '$routeParams', '$sce', 'search', 'settings', 'hot', 'starred', function($scope, $location, $http, $routeParams, $sce, search, settings, hot, starred) {
  // Init search et params
  $scope.category = $routeParams.cat;
  $scope.settings = settings.get($scope.category);
  $scope.results = null;
  $scope.story = {};

  // reset
  window.scrollTo(0, 0);
  $scope.resetQuery = function() {
    $scope.settings.page = 0;
    search.query = '';
  };

  var getIndex = function(q) {
    if ($scope.settings.sort === 'byDate') {
      return settings.indexSortedByDate;
    } else if (q.trim().split(/ +/).length === 1) {
      return settings.indexSortedByPopularityOrdered;
    } else {
      return settings.indexSortedByPopularity;
    }
  };

  //Search scope
  $scope.getSearch = function(withComments) {
    NProgress.start();
    var _search = function(ids) {
      getIndex(search.query).search(search.query, undefined, search.getParams(ids)).then(function(results) {
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

    if ($scope.category === 'hot') {
      hot.get().then(function(ids) {
        _search(ids);
      });
    } else if ($scope.category === 'starred') {
      _search(starred.all());
    } else {
      _search();
    }
  };

  $scope.loadComments = function(id, $event) {
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
        //console.log(startStickPosition + ' < ' + wrap.scrollTop() + ' < ' + endStickPosition);

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

  $scope.categoryTitle = function() {
    switch ($scope.category) {
    case undefined: return 'All';
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

  // Watch settings
  $scope.$watchCollection('settings', function(newSettings) {
    search.applySettings(newSettings);
    $scope.getSearch();
  });

  // run 1st query
  search.applySettings($scope.settings);
  $scope.getSearch(true);
}])

.controller('SettingsCtrl', ['$scope', 'settings', function($scope, settings) {
  $scope.isSettings = true;
  $scope.settings = settings.get();

  $scope.$watchCollection('settings', function() {
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
                '<span class="author"><avatar author="reply.author"></avatar> {{reply.author}}</span> - <span class="date">{{reply.created_at_i | moment:"M/D/YYYY h:m A"}}</span>' +
                '<div class="reply-container" ng-bind-html="reply.text|cleanup"></div>' +
              '</li>'
  };
}])

.directive('hnsearch', ['search', '$location', function(search, $location) {
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

      scope.$watch('query', function (newValue, oldValue) {
        if(newValue === oldValue || typeof newValue === 'undefined') {
          return;
        }
        search.query = scope.query;
        scope.getData();
      });

    },
    template: '<div class="item-input-wrapper">' +
                '<i ng-hide="query" class="icon-search"></i>' +
                '<input type="search" placeholder="{{placeholder}}" ng-model="query" ng-blur="blurred()">' +
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
      path = path.substring(1); //hack because path does not return including hashbang
      scope.location = location;
      scope.$watch('location.path()', function(newPath) {
        if (path === newPath || (path === '/' && newPath === '')) {
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
