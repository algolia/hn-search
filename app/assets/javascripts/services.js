angular.module('HNSearch.services', ['algoliasearch', 'ngStorage'])

.factory('settings', ['$location', 'algolia', '$localStorage', function($location, algolia, $localStorage) {
    var settingsService = {};

    //default settings
    var storage = $localStorage.$default({
        showThumbnails: true,
        defaultSort: 'byDate',
        defaultDateRange: 'last24h'
    });

    var _loadSettings = function() {
        var queryParameters = $location.search();
        return {
            dateRange: (queryParameters.dateRange || storage.defaultDateRange),
            defaultDateRange: storage.defaultDateRange,
            type: (queryParameters.type || 'story'),
            sort: (queryParameters.sort || storage.defaultSort),
            defaultSort: storage.defaultSort,
            prefix: (queryParameters.prefix || true),
            page: (parseInt(queryParameters.page, 10) || 0),
            showThumbnails: storage.showThumbnails,
            loadedComments: (queryParameters.comments ? queryParameters.comments.split(',') : [])
        };
    }
    var settings = _loadSettings();

    // Algolia settings
    var algoliaConfig = { appID: 'UJ5WYC0L7X', apiKey: '8ece23f8eb07cd25d40262a1764599b1' }; // FIXME

    settingsService.client = algolia.Client(algoliaConfig.appID, algoliaConfig.apiKey);
    settingsService.indexSortedByPopularity = settingsService.client.initIndex('Item_production');
    settingsService.indexSortedByPopularityOrdered = settingsService.client.initIndex('Item_production_ordered');
    settingsService.indexSortedByDate = settingsService.client.initIndex('Item_production_sort_date');
    settingsService.indexUser = settingsService.client.initIndex('User_production');

    settingsService.reload = function() {
        var tmp = _loadSettings();
        for (var k in tmp) {
            settings[k] = tmp[k];
        }
        return settings;
    };

    settingsService.get = function() {
        return settings;
    };

    settingsService.save = function() {
        $localStorage.showThumbnails = settings.showThumbnails;

        if ($localStorage.defaultSort != settings.defaultSort) {
            settings.sort = settings.defaultSort;
        }
        $localStorage.defaultSort = settings.defaultSort;

        if ($localStorage.defaultDateRange != settings.defaultDateRange) {
            settings.dateRange = settings.defaultDateRange;
        }
        $localStorage.defaultDateRange = settings.defaultDateRange;
    };

    settingsService.loadComments = function(id) {
        settings.loadedComments.push(id);
        $location.search('comments', settings.loadedComments.join(','));
    };

    return settingsService;
}])

.factory('search', ['$location', function($location) {
    var queryParameters = $location.search();
    var searchService = {
        query: (queryParameters.query || queryParameters.q || ''),
        params: {
            hitsPerPage: 20,
            minWordSizefor1Typo: 5,
            minWordSizefor2Typos: 9,
            advancedSyntax: true,
            ignorePlurals: true
        }
    };

    //dates
    var last24h = new Date();
    var pastWeek = new Date();
    var pastMonth = new Date();
    last24h = last24h.setDate(last24h.getDate() - 1) / 1000;
    pastWeek = pastWeek.setDate(pastWeek.getDate() - 7) / 1000;
    pastMonth = pastMonth.setDate(pastMonth.getDate() - 31) / 1000;

    searchService.applySettings = function(settings, page) {
        this.params.tagFilters = [];

        // query
        $location.search('query', this.query);
        $location.search('sort', settings.sort);
        $location.search('prefix', settings.prefix);
        $location.search('page', settings.page);
        $location.search('comments', settings.loadedComments.join(','));
        this.params.page = settings.page;

        // date range
        $location.search('dateRange', settings.dateRange);
        if (settings.hasOwnProperty('dateRange')){
            if (settings.dateRange === 'all'){
                this.params.numericFilters = '';
            } else if (settings.dateRange === 'last24h'){
                this.params.numericFilters = 'created_at_i>' + last24h;
            } else if (settings.dateRange === 'pastWeek'){
                this.params.numericFilters = 'created_at_i>' + pastWeek;
            } else if (settings.dateRange === 'pastMonth'){
                this.params.numericFilters = 'created_at_i>' + pastMonth;
            }
        }

        // story type
        switch (page) {
        case 'ask-hn':
            this.params.tagFilters.push('ask_hn');
            break;
        case 'show-hn':
            this.params.tagFilters.push('show_hn');
            break;
        case 'jobs':
            this.params.tagFilters.push('job');
            break;
        case 'polls':
            this.params.tagFilters.push('poll');
            break;
        }

        // item type
        $location.search('type', settings.type);
        if (settings.type && (page !== 'jobs' && page !== 'polls')) {
            this.params.tagFilters.push(settings.type);
        }

        // prefix
        this.params.queryType = settings.prefix ? 'prefixLast' : 'prefixNone';

        return this.params;
    };

    searchService.getParams = function(storyIDs) {
        var res = angular.copy(this.params);

        // restrict the search to a subset of story IDs
        if (storyIDs) {
            if (storyIDs.length === 0) {
                res.tagFilters.push('no_results');
            } else {
                var stories = [];
                for (var i = 0; i < storyIDs.length; ++i) {
                    stories.push('story_' + storyIDs[i]);
                }
                res.tagFilters.push(stories);
            }
        }

        return res;
    };
    return searchService;
}])


.factory('hot', ['$q', '$http', function($q, $http) {
    var hotService = {
        items: [],
        refreshedAt: 0
    };

    // get top stories IDs (async, 60sec refresh rate)
    hotService.get = function() {
        var now = new Date().getTime();
        var deferred = $q.defer();
        if (this.items.length === 0 || this.refreshedAt < now - 60000) {
            var self = this;
            $http.get('https://hacker-news.firebaseio.com/v0/topstories.json').then(function(result) {
                self.refreshedAt = now;
                self.items = result.data;
                deferred.resolve(self.items);
            });
        } else {
            deferred.resolve(this.items);
        }
        return deferred.promise;
    };

    return hotService;
}])

.factory('starred', ['$localStorage', function($localStorage) {
    var starredService = {};

    $localStorage.starred = $localStorage.starred || {};
    starredService.add = function(id) {
        $localStorage.starred[id] = new Date();
    };

    starredService.remove = function(id) {
        delete $localStorage.starred[id];
    };

    starredService.toggle = function(id) {
        if (this.is(id)) {
            this.remove(id);
        } else {
            this.add(id);
        }
    };

    starredService.is = function(id) {
        return !!$localStorage.starred[id];
    }

    starredService.all = function() {
        var res = [];
        for (var id in $localStorage.starred) {
            res.push(id);
        }
        return res;
    };

    return starredService;
}])

.filter('moment', function() {
    return function(dateString, format) {
        return moment(dateString * 1000).fromNow();
    };
})

.filter('firstLetter', function() {
    return function(str) {
        return str ? str.charAt(0) : '';
    };
})

.filter('color', function() {
    return function(str) {
        if(typeof str !== 'undefined'){
            // str to hash
            for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
            // int/hash to hex
            for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));
            return colour;
        }
    };
})

.filter( 'domain', function () {
  return function ( input ) {
    var matches,
        output = "",
        urls = /\w+:\/\/([\w|\.]+)/;
    matches = urls.exec( input );
    if ( matches !== null ) output = matches[1];
    return output;
  };
})

.filter('cleanup', function() {
    return function (input) {
        return input;
        if (!input) {
            return input;
        }

        // handle line breaks
        var str = input.replace(/(\\r)?\\n/g, '<br />');

        // remove stopwords highlighting
        str = str.replace(/<em>(a|an|s|is|and|are|as|at|be|but|by|for|if|in|into|is|it|no|not|of|on|or|such|the|that|their|then|there|these|they|this|to|was|will|with)<\/em>/ig, '$1');

        // work-around =\\" escaping bug (6c92ae092359647c04804876139516163d0567de)
        str = str.replace(/=\\"/g, '="');

        return '<p>' +  str.replace(/<p>/g, '</p><p>') + '</p>';
    };
})

;
