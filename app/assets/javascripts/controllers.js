angular.module('HNSearch.controllers', ['algoliasearch', 'ngSanitize'])

.controller('SearchCtrl', function($scope, $http, $sce, algolia, story, search, settings) {

  // Algolia settings
  // Hacker news credentials for demo purpose
  var algoliaConfig = {
    appID: 'UJ5WYC0L7X',
    apiKey: '8ece23f8eb07cd25d40262a1764599b1',
    index: 'Item_production'
  }
  var client = algolia.Client(algoliaConfig.appID, algoliaConfig.apiKey);
  var index = client.initIndex(algoliaConfig.index);


  // Search
  search.setParams(settings.init());
  $scope.search = search.get();
  $scope.results = [];

  //Search scope
  $scope.getSearch = function(query) {
    search.setQuery(query);
    index.search(query, undefined, $scope.search.params).then(
      function(results) {
        $scope.results = results;
      }
    );
  };

  $scope.story= {};

  $scope.loadComments = function(hit) {
    $http.get('https://hn.algolia.com/api/v1/items/' + hit.objectID).
    success(function(data) {
      $scope.story[hit.objectID] = {comments: data};
    });
  };
})

.controller('SettingsCtrl', function($scope, settings) {
  $scope.settings = settings.get();
  $scope.$watchCollection('settings', function(newSettings){
    settings.set(newSettings);
  });
})


.directive('collection', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      collection: "="
    },
    template: "<ul class='replies-list'><reply ng-repeat='reply in collection' reply='reply'></reply></ul>"
  };
})

.directive('reply', function($compile) {
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
                '<i class="icon ion-reply"></i> <span class="author">{{reply.author}}</span> - <small>{{reply.created_at_i | moment:"M/D/YYYY h:m A"}}</small>' +
                '<div ng-bind-html="reply.text"></div>' +
              '</li>'
  };
})

.directive('hnsearch', function(search) {
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
      scope.search = search.get();

      if (attrs.class)
        element.addClass(attrs.class);

      scope.$watch('search.query', function (newValue, oldValue) {
        scope.getData({query: newValue});
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
});
