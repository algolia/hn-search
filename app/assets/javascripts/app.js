var app = angular.module('HNSearch', [
  'ngRoute',
  'templates',
  'HNSearch.controllers',
  'HNSearch.services'
])

.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
  // setup CSRF token
  $httpProvider.defaults.headers.common["X-CSRF-TOKEN"] = $('meta[name="csrf-token"]').attr('content');

  // use JSON by default
  $httpProvider.defaults.headers.common.Accept = 'application/json';

  // routes
  $routeProvider
    .when('/settings', {
      templateUrl: 'settings.html',
      controller: 'SettingsCtrl'
    }).when('/:cat?', {
      templateUrl: 'home.html',
      controller: 'SearchCtrl',
      roloadOnSearch: false
    }).otherwise({
      redirectTo: '/'
    });
}])

.run(['$rootScope', '$location', function($rootScope, $location) {
  $rootScope.$on('$routeChangeStart', function (event, next) {
    // backward compatibility
    if ($location.path().indexOf('!/') === 0 || $location.path().indexOf('/!/') === 0) {
      var parts = $location.path().substring($location.path().indexOf('!/') === 0 ? 2 : 3).split('/');
      var type = parts.shift();
      var created_at = parts.shift();
      var v = parts.shift();
      var prefixedSearch, page;
      if (v === 'prefix') {
        prefixedSearch = true;
        page = parseInt(parts.shift());
      } else {
        prefixedSearch = false;
        page = parseInt(v);
      }
      var q = decodeURIComponent(parts.join('/'));

      var dateRange;
      switch (created_at) {
      case "last_24h": dateRange = "last24h"; break;
      case "past_week": dateRange = "pastWeek"; break;
      case "past_month": dateRange = "pastMonth"; break;
      default: dateRange = "all"; break;
      }

      event.preventDefault();
      $rootScope.$evalAsync(function() {
        $location.path('/').search({
          query: encodeURIComponent(q),
          type: type,
          dateRange: dateRange,
          prefix: prefixedSearch,
          page: page
        });
      });
    }
  });
}]);


$(document).ready(function() {
  // sticky main
  var body = $('body');
  var doc = $(document)
  doc.on("scroll", function(e) {
    if (doc.scrollTop() > 100) {
      body.addClass('small-header');
    } else {
      body.removeClass('small-header');
    }
  });
});
