angular.module('HNSearch.services', ['ngStorage', 'angular-google-analytics'])

.factory('settings', ['$location', '$localStorage', 'Analytics', function($location, $localStorage, Analytics) {
    var settingsService = {};

    //default settings
    var storage = $localStorage.$default({
        showThumbnails: true,
        defaultType: 'story',
        defaultSort: 'byPopularity',
        defaultDateRange: 'all',
        style: 'default',
        typoTolerance: true,
        storyText: true,
        authorText: true,
        hitsPerPage: 20
    });

    var _loadSettings = function() {
        var queryParameters = $location.search();
        var defaultDateRange, defaultSort, defaultType;
        if (queryParameters.q) {
            $location.search('query', queryParameters.q).search('q', null).replace();
            defaultDateRange = 'all';
            defaultSort = 'byPopularity';
            defaultType = 'story';
        } else {
            defaultDateRange = storage.defaultDateRange;
            defaultSort = storage.defaultSort;
            defaultType = storage.defaultType;
        }
        return {
            dateRange: (queryParameters.dateRange || defaultDateRange),
            defaultDateRange: storage.defaultDateRange,
            type: (queryParameters.type || defaultType),
            sort: (queryParameters.sort || defaultSort),
            defaultType: storage.defaultType,
            defaultSort: storage.defaultSort,
            prefix: (queryParameters.prefix || true),
            page: (parseInt(queryParameters.page, 10) || 0),
            showThumbnails: storage.showThumbnails,
            login: storage.login,
            style: (queryParameters.experimental ? 'experimental' : storage.style),
            dateStart: queryParameters.dateStart,
            dateEnd: queryParameters.dateEnd,
            typoTolerance: storage.typoTolerance,
            storyText: (typeof queryParameters.storyText === 'undefined' ? storage.storyText : (queryParameters.storyText === 'true')),
            authorText: (typeof queryParameters.authorText === 'undefined' ? storage.authorText : (queryParameters.authorText === 'true')),
            hitsPerPage: storage.hitsPerPage
        };
    }
    var settings = _loadSettings();

    // Algolia settings
    settingsService.client = algoliasearch('UJ5WYC0L7X', '8ece23f8eb07cd25d40262a1764599b1');

    settingsService.indexUser = settingsService.client.initIndex('User_production');
    settingsService.indexSortedByPopularity = settingsService.client.initIndex('Item_production');
    settingsService.indexSortedByDate = settingsService.client.initIndex('Item_production_sort_date');
    settingsService.indexSortedByPopularityOrdered = settingsService.client.initIndex('Item_production_ordered');

    settingsService.reset = function() {
        settings.dateRange = settings.defaultDateRange;
        settings.sort = settings.defaultSort;
        settings.type = settings.defaultType;
        settings.page = 0;
    };

    settingsService.get = function() {
        return settings;
    };

    settingsService.reload = function() {
        var s = _loadSettings();
        for (var v in s) {
            settings[v] = s[v];
        }
        return settings;
    }

    settingsService.save = function() {
        $localStorage.showThumbnails = settings.showThumbnails;
        $localStorage.login = settings.login;
        $localStorage.style = settings.style;
        $localStorage.typoTolerance = settings.typoTolerance;
        $localStorage.storyText = settings.storyText;
        $localStorage.authorText = settings.authorText;
        $localStorage.hitsPerPage = settings.hitsPerPage;
        $('body').attr('rel', settings.style);

        if ($localStorage.defaultType != settings.defaultType) {
            settings.type = settings.defaultType;
        }
        $localStorage.defaultType = settings.defaultType;

        if ($localStorage.defaultSort != settings.defaultSort) {
            settings.sort = settings.defaultSort;
        }
        $localStorage.defaultSort = settings.defaultSort;

        if ($localStorage.defaultDateRange != settings.defaultDateRange) {
            settings.dateRange = settings.defaultDateRange;
        }
        $localStorage.defaultDateRange = settings.defaultDateRange;

        // GA
        Analytics.trackEvent('settings', 'style', settings.style);
        Analytics.trackEvent('settings', 'defaultType', settings.defaultType);
        Analytics.trackEvent('settings', 'defaultSort', settings.defaultSort);
        Analytics.trackEvent('settings', 'defaultDateRange', settings.defaultDateRange);
    };

    return settingsService;
}])

.factory('search', ['$location', function($location) {
    var queryParameters = $location.search();
    var searchService = {
        query: (queryParameters.query || queryParameters.q || ''),
        params: {
            hitsPerPage: 20,
            minWordSizefor1Typo: 4,
            minWordSizefor2Typos: 8,
            advancedSyntax: true,
            ignorePlurals: false,
            clickAnalytics: true
        }
    };

    //dates
    var last24h = new Date();
    var pastWeek = new Date();
    var pastMonth = new Date();
    var pastYear = new Date();
    last24h = last24h.setDate(last24h.getDate() - 1) / 1000;
    pastWeek = pastWeek.setDate(pastWeek.getDate() - 7) / 1000;
    pastMonth = pastMonth.setDate(pastMonth.getDate() - 31) / 1000;
    pastYear = pastYear.setDate(pastYear.getDate() - 365) / 1000;


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
        case 'user':
            this.params.tagFilters.push('author_' + settings.login);
            break;
        }

        // hits per page
        this.params.hitsPerPage = settings.hitsPerPage;

        if (first) {
            $location.replace();
            first = false;
        }

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
                    stories.push('job_' + storyIDs[i]);
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

.filter('color', function() {
    return function(str) {
        if (str) {
            // str to hash
            for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
            // int/hash to hex
            for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));
            return colour;
        } else {
            return 'black';
        }
    };
})

.filter( 'domain', ['settings', function (settings) {
    var settings = settings.get();
    return function ( input ) {
        if (settings.style === 'default') {
            return '(' + input + ')';
        }
        var a = document.createElement('a');
        a.href = input && input.replace(/<em>/ig, '_B_EM_').replace(/<\/em>/ig, '_E_EM_');
        return a.hostname && a.hostname.replace(/_B_EM_/gi, '<em>').replace(/_E_EM_/gi, '</em>');
    };
}])

;
