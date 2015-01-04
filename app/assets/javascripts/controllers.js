angular.module('HNSearch.controllers', ['algoliasearch', 'ngSanitize'])

.controller('SearchCtrl', ['$scope', '$http', '$routeParams', '$sce', 'algolia', 'story', 'search', 'settings', 'hot', function($scope, $http, $routeParams, $sce, algolia, story, search, settings, hot) {

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
    } else {
      _search();
    }
  };

  $scope.loadComments = function(hit) {
    $http.get('https://hn.algolia.com/api/v1/items/' + hit.objectID).
    success(function(data) {
      $scope.story[hit.objectID] = {comments: data};
    });
  };

  $scope.sortBy = function(order) {
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

  $scope.$watchCollection('settings', function(newSettings){
    search.applySettings(newSettings);
    $scope.getSearch(search.query, search.params);
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

      if (attrs.class)
        element.addClass(attrs.class);

      scope.$watch('search.query', function (newValue, oldValue) {
        if(newValue === oldValue){
          return;
        }
        var query = newValue || '';
        search.setQuery(query);
        scope.getData();
      });

      scope.clearSearch = function() {
        scope.search.query = '';
      };

    },
    template: '<div class="item-input-wrapper">' +
                '<i class="icon ion-android-search"></i>' +
                '<input type="search" placeholder="{{placeholder}}" ng-model="search.query">' +
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
