angular.module('HNSearch.controllers', ['algoliasearch', 'ngSanitize'])

.controller('SearchCtrl', ['$scope', '$http', '$routeParams', '$sce', 'algolia', 'story', 'search', 'settings', 'hot', 'starred', function($scope, $http, $routeParams, $sce, algolia, story, search, settings, hot, starred) {

  // Algolia settings
  // Hacker news credentials for demo purpose
  var algoliaConfig = {
    appID: 'UJ5WYC0L7X',
    apiKey: '8ece23f8eb07cd25d40262a1764599b1'
  }
  var client = algolia.Client(algoliaConfig.appID, algoliaConfig.apiKey);
  var indexSortedByPopularity = client.initIndex('Item_production');
  var indexSortedByPopularityOrdered = client.initIndex('Item_production_ordered');
  var indexSortedByDate = client.initIndex('Item_production_sort_date');

  // Init search et params
  $scope.settings = settings.init($routeParams.cat);
  search.applySettings($scope.settings);
  $scope.results = null;
  $scope.story = {};

  var getIndex = function(q) {
    if ($scope.settings.sort === 'byDate') {
      return indexSortedByDate;
    } else if (q.trim().split(/ +/).length === 1) {
      return indexSortedByPopularityOrdered;
    } else {
      return indexSortedByPopularity;
    }
  };

  //Search scope
  $scope.getSearch = function() {
    var _search = function(ids) {
      getIndex(search.query).search(search.query, undefined, search.getParams(ids)).then(function(results) {
        $scope.results = results;
      });
    };

    if ($routeParams.cat === 'hot') {
      hot.get().then(function(ids) {
        _search(ids);
      });
    } else if ($routeParams.cat === 'starred') {
      _search(starred.all());
    } else {
      _search();
    }
  };

  $scope.loadComments = function($event, hit) {
    $event.preventDefault();
    $http.get('https://hn.algolia.com/api/v1/items/' + hit.objectID).
    success(function(data) {
      $scope.story[hit.objectID] = {comments: data};
    });
  };

  $scope.sortBy = function(order) {
    $scope.settings.page = 0;
    $scope.settings.sort = order;
  };

  $scope.categoryTitle = function() {
    switch ($routeParams.cat) {
    case undefined: return 'All';
    case "ask-hn": return "Ask HN";
    case "show-hn": return "Show HN";
    case "jobs": return "Jobs";
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
  $scope.$watchCollection('settings', function(newSettings){
    search.applySettings(newSettings);
    $scope.getSearch();
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
                '<span ng-style="{color:\'{{reply.author|color}}\'}" class="author">{{reply.author}}</span> - <span class="date">{{reply.created_at_i | moment:"M/D/YYYY h:m A"}}</span>' +
                '<div class="reply-content" ng-bind-html="reply.text"></div>' +
              '</li>'
  };
}])

.directive('hnsearch', ['search', function(search) {
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

      scope.$watch('query', function (newValue, oldValue) {
        if(newValue === oldValue || typeof newValue === 'undefined') {
          return;
        }
        search.setQuery(newValue);
        scope.getData();
      });

      scope.clearSearch = function() {
        scope.search.query = '';
      };

    },
    template: '<div class="item-input-wrapper">' +
                '<i class="icon ion-android-search"></i>' +
                '<input type="search" placeholder="{{placeholder}}" ng-model="query">' +
                '<i ng-if="search.query.length > 0" ng-click="clearSearch()" class="icon ion-close"></i>' +
              '</div>'
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
        if (path === newPath) {
          element.addClass('active');
        } else {
          element.removeClass('active');
        }
      });
    }
  };
}])

;
