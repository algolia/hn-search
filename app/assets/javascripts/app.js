var app = angular.module('HNSearch', [
  'ui.router',
  'ngRoute',
  'templates',
  'HNSearch.controllers',
  'HNSearch.services',
  'angular-google-analytics'
])

.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', 'AnalyticsProvider', function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, AnalyticsProvider) {
  // setup CSRF token
  $httpProvider.defaults.headers.common["X-CSRF-TOKEN"] = $('meta[name="csrf-token"]').attr('content');

  // use JSON by default
  $httpProvider.defaults.headers.common.Accept = 'application/json';
  $httpProvider.useApplyAsync(true);

  // html 5 mode
  $locationProvider.html5Mode(true);

  // backward compat
  var hash = window.location.hash;
  var backwardCompatParams;
  if (hash.indexOf('#!/') === 0) {
    var parts = hash.substring(3).split('/');
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

    backwardCompatParams = {
      query: q,
      type: type,
      dateRange: dateRange,
      prefix: prefixedSearch,
      page: page
    };
  }

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
    .state('root.help', {
      url: '/help',
      views: {
        'main-header': { template: '<h1>Help</h1>' },
        'main-content': { templateUrl: 'help.html' }
      }
    })
    .state('settings', {
      abstract: true,
      templateUrl: 'layout.html',
      controller: 'SettingsCtrl'
    })
    .state('settings.edit', {
      url: '/settings',
      views: {
        'main-header': { template: '<h1>Settings</h1>' },
        'main-content': { templateUrl: 'settings.html' }
      }
    })
    .state('search', {
      abstract: true,
      templateUrl: 'layout.html',
      controller: 'SearchCtrl'
    })
    .state('search.story', {
      url: '/story/{id}{title:(?:/[^/]+)?}',
      views: {
        'col-2@search': { templateUrl: '_home-col-2.html' },
        'main-header@search': { templateUrl: '_home-header.html' },
        'main-content@search': { templateUrl: 'home.html', controller: 'StoryCtrl' }
      }
    })
    .state('search.page', {
      url: '/:page',
      views: {
        'col-2@search': { templateUrl: '_home-col-2.html' },
        'main-header@search': { templateUrl: '_home-header.html' },
        'main-content@search': { templateUrl: 'home.html' }
      },
      onEnter: ['$location', function($location) {
        if (backwardCompatParams) {
          $location.path('/').search(backwardCompatParams).replace();
          backwardCompatParams = null;
        }
      }]
    })
    ;

    // GA
    AnalyticsProvider.setAccount('UA-32446386-3');
    AnalyticsProvider.useCrossDomainLinker(true);
    AnalyticsProvider.setCrossLinkDomains(['new-hn.algolia.com', 'hn.algolia.com']);
    AnalyticsProvider.trackPages(true);
    AnalyticsProvider.setPageEvent('$stateChangeSuccess');
}])

$(document).ready(function() {
  var doc = $(document);
  var body = $('body');

  //responsive states
  var smallDevice = 480, mediumDevice = 768, largeDevice = 1200;
  ssm.addState({
    id: 'desktop',
    minWidth: mediumDevice,
    onEnter: function(){
      $('aside.sidebar, .sliding-menu-fade-screen').removeClass('is-visible');
    }
  });

  ssm.addState({
    id: 'mobile',
    maxWidth: smallDevice,
    onEnter: function(){
      $('body').addClass('small-header');
    }
  });
  ssm.ready();

  // sticky main
  doc.on("scroll", function(e) {
    if (body.attr('rel') === 'default') {
      return;
    }
    if (doc.scrollTop() > 100) {
      body.addClass('small-header');
      scrollTopBtn.addClass('in');
    } else if(!ssm.isActive('mobile')){
      body.removeClass('small-header');
      scrollTopBtn.removeClass('in');
    }
  });

  //scroll top
  var scrollTopBtn = $('.scroll-to-top');
  scrollTopBtn.on('click', function(e){
    e.preventDefault();
    doc.scrollTop(0);
  });
  doc.keydown(function(e){
    if (e.keyCode == 38)
      doc.scrollTop(0);
  });
});

window.trackResource = function(query){
  try {
    if (window.performance === undefined || typeof window.performance.getEntriesByType !== "function") {
      return false
    }
    var resources = window.performance.getEntriesByType("resource");

    if (resources === undefined || resources.length <= 0) {
      return false
    }

    var lastAlgoliaRequest = resources.reverse().find(function(resource){
      return resource.initiatorType === 'xmlhttprequest' && resource.name.indexOf('x-algolia-agent') > -1
    })

    // Redirect time
    var redirectTime = Math.round(lastAlgoliaRequest.redirectEnd - lastAlgoliaRequest.redirectStart);
    // DNS time
    var dnsTime = Math.round(lastAlgoliaRequest.domainLookupEnd - lastAlgoliaRequest.domainLookupStart);
    // TCP handshake time
    var TCPTime = Math.round(lastAlgoliaRequest.connectEnd - lastAlgoliaRequest.connectStart);
    // Secure connection time
    var TLS = Math.round(lastAlgoliaRequest.secureConnectionStart > 0 ? (lastAlgoliaRequest.connectEnd - lastAlgoliaRequest.secureConnectionStart) : 0);
    // Response time
    var responseTime = Math.round(lastAlgoliaRequest.responseEnd - lastAlgoliaRequest.responseStart);
    // Fetch until response end
    var fetchTillResponseEnd = Math.round((lastAlgoliaRequest.fetchStart > 0) ? (lastAlgoliaRequest.responseEnd - lastAlgoliaRequest.fetchStart) : 0);
    // Request start until reponse end
    var requestStartTillResponseEnd = Math.round((lastAlgoliaRequest.requestStart > 0) ? (lastAlgoliaRequest.responseEnd - lastAlgoliaRequest.requestStart) : 0);
    // Start until reponse end
    var startToEnd = Math.round((lastAlgoliaRequest.startTime > 0) ? (lastAlgoliaRequest.responseEnd - lastAlgoliaRequest.startTime) : 0);
    // Decoded body size
    var decodedBodySize = lastAlgoliaRequest.decodedBodySize
    // Encoded body size
    var encodedBodySize = lastAlgoliaRequest.encodedBodySize
    // transferSize
    var transferSize = lastAlgoliaRequest.transferSize
    // Engine processing time
    var engineProcessingTime = query.processingTimeMS

    var supportsNavigator = navigator && typeof navigator.sendBeacon === 'function';
    
    var data = {
      redirectTime,
      dnsTime,
      TCPTime,
      TLS,
      responseTime,
      fetchTillResponseEnd,
      requestStartTillResponseEnd,
      startToEnd,
      decodedBodySize,
      encodedBodySize,
      transferSize,
      engineProcessingTime,
      nextHopProtocol: lastAlgoliaRequest.nextHopProtocol,
      domain: lastAlgoliaRequest.name.match(/(.*)\:\/\/(.*?)\//)[2]
    }

    if (navigator.connection) {
      if(navigator.connection.effectiveType) {
        data.effectiveType = navigator.connection.effectiveType;
      }
      if(navigator.connection.downlink) {
        data.downLink = navigator.connection.downLink === Infinity ? -1 : navigator.connection.downlink;
      }
      if(navigator.connection.downlinkMax) {
        data.downlinkMax = navigator.connection.downlinkMax === Infinity ? -1 : navigator.connection.downlinkMax;
      }
      if(navigator.connection.type) {
        data.type = navigator.connection.type;
      }
    }

    var url = "https://telemetry.algolia.com/dev/v1/measure"

    if(supportsNavigator){
      navigator.sendBeacon(url, JSON.stringify(data));
    } else {
      $.ajax({
        contentType: "application/json",
        type: "POST",
        url: url,
        data: JSON.stringify(data)
      });
    }
  } catch(e){
    // Silently catch and resume script execution
    // Resource timing api was likely not supported
  }
}
