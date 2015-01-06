var app = angular.module('HNSearch', [
  'ui.router',
  'ngRoute',
  'templates',
  'HNSearch.controllers',
  'HNSearch.services'
])

.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
  // setup CSRF token
  $httpProvider.defaults.headers.common["X-CSRF-TOKEN"] = $('meta[name="csrf-token"]').attr('content');

  // use JSON by default
  $httpProvider.defaults.headers.common.Accept = 'application/json';

  // routes
  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state('root', {
      url: '',
      abstract: true,
      templateUrl: 'layout.html',
    })
    .state('root.about', {
      url: '/about',
      views: {
        'main-header': { template: '<h1>About</h1>' },
        'main-content': { templateUrl: 'about.html' }
      }
    })
    .state('root.cool_apps', {
      url: '/cool_apps',
      views: {
        'main-header': { template: '<h1>Cool apps</h1>' },
        'main-content': { templateUrl: 'cool_apps.html' }
      }
    })
    .state('root.api', {
      url: '/api',
      views: {
        'main-header': { template: '<h1>HN Search API</h1>' },
        'main-content': { templateUrl: 'api.html' }
      }
    })
    .state('root.settings', {
      url: '/settings',
      views: {
        'main-header': { template: '<h1>Settings</h1>' },
        'main-content': { templateUrl: 'settings.html', controller: 'SettingsCtrl' }
      }
    })
    .state('search', {
      abstract: true,
      templateUrl: 'layout.html',
      controller: 'SearchCtrl'
    })
    .state('search.home', {
      url: '/:cat',
      views: {
        'col-2@search': { templateUrl: '_home-col-2.html' },
        'col-3@search': { templateUrl: '_home-col-3.html' },
        'main-header@search': { templateUrl: '_home-header.html' },
        'main-content@search': { templateUrl: 'home.html' }
      },
      onEnter: ['settings', '$stateParams', function(settings, $stateParams) {
        settings.get().category = $stateParams.cat;
      }]
    })
    ;
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
