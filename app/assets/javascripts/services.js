angular.module('HNSearch.services', ['algoliasearch', 'ngStorage', 'angular-google-analytics'])

.factory('settings', ['$location', 'algolia', '$localStorage', 'Analytics', function($location, algolia, $localStorage, Analytics) {
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
    var algoliaConfig = { appID: 'UJ5WYC0L7X', apiKey: '8ece23f8eb07cd25d40262a1764599b1' }; // FIXME

    settingsService.client = algolia.Client(algoliaConfig.appID, algoliaConfig.apiKey);
    settingsService.indexSortedByPopularity = settingsService.client.initIndex('Item_production');
    settingsService.indexSortedByPopularityOrdered = settingsService.client.initIndex('Item_production_ordered');
    settingsService.indexSortedByDate = settingsService.client.initIndex('Item_production_sort_date');
    settingsService.indexUser = settingsService.client.initIndex('User_production');

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

    var first = true;
    searchService.applySettings = function(settings, page) {
        this.params.tagFilters = [];
        this.params.numericFilters = [];

        // query
        $location.search('query', this.query);
        $location.search('sort', settings.sort);
        $location.search('prefix', settings.prefix);
        $location.search('page', settings.page);
        this.params.page = settings.page;

        // date range
        $location.search('dateRange', settings.dateRange);
        $location.search('dateStart', null);
        $location.search('dateEnd', null);
        if (settings.hasOwnProperty('dateRange')){
            if (settings.dateRange === 'all'){
            } else if (settings.dateRange === 'last24h'){
                this.params.numericFilters.push('created_at_i>' + last24h);
            } else if (settings.dateRange === 'pastWeek'){
                this.params.numericFilters.push('created_at_i>' + pastWeek);
            } else if (settings.dateRange === 'pastMonth'){
                this.params.numericFilters.push('created_at_i>' + pastMonth);
            } else if (settings.dateRange === 'pastYear'){
                this.params.numericFilters.push('created_at_i>' + pastYear);
            } else if (settings.dateRange === 'custom' && settings.dateStart && settings.dateEnd) {
                $location.search('dateStart', settings.dateStart);
                $location.search('dateEnd', settings.dateEnd);
                this.params.numericFilters.push('created_at_i>' + settings.dateStart);
                this.params.numericFilters.push('created_at_i<' + settings.dateEnd);
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
        case 'user':
            this.params.tagFilters.push('author_' + settings.login);
            break;
        }

        // item type
        $location.search('type', settings.type);
        if (page !== 'jobs' && page !== 'polls') {
            switch (settings.type) {
                case '':
                case undefined:
                case 'all':
                  this.params.tagFilters.push(['story', 'comment', 'poll', 'job']);
                  break;
                case 'story':
                case 'comment':
                  this.params.tagFilters.push(settings.type);
                  break;
            }
        }

        // prefix
        this.params.queryType = settings.prefix ? 'prefixLast' : 'prefixNone';

        // typo tolerance
        this.params.typoTolerance = settings.sort === 'byPopularity' && settings.typoTolerance;

        // restrict attributes to search on, based on storyText and authorText settings
        this.params.restrictSearchableAttributes = ['title', 'comment_text', 'url'];
        if (settings.storyText) {
            this.params.restrictSearchableAttributes.push('story_text');
        } else{
            $location.search('storyText', false);
        }
        if (settings.authorText) {
            this.params.restrictSearchableAttributes.push('author');
        } else {
            $location.search('authorText', false);
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

.filter('cleanup', function() {
    return function (input) {
        if (!input) {
            return input;
        }

        // handle line breaks
        var str = input.replace(/(\\r)?\\n/g, '<br />');

        // remove stopwords highlighting
        str = str.replace(/<em>(a|an|s|is|and|are|as|at|be|but|by|for|if|in|into|is|it|no|not|of|on|or|such|the|that|their|then|there|these|they|this|to|was|will|with)<\/em>/ig, '$1');

        // work-around =\\" escaping bug (6c92ae092359647c04804876139516163d0567de)
        str = str.replace(/=\\"/g, '="');

        // XSS (seems HN is not stripping all of them)
        str = $('<div />').text(str).html()
            // keep some tags like <p>, <pre>, <em>, <strong>, <code> & <i>
            .replace(/&lt;(\/?)(p|pre|code|em|strong|i)&gt;/g, '<$1$2>')
            // restore predefined XML entities (quotes, apos & amps)
            .replace(/&quot;/g, '"').replace(/&apos;/g, '\'').replace(/&amp;/g, '&')
            // restore links as well
            .replace(/&lt;a href="([^"]+?)" rel="nofollow"&gt;(.+?)&lt;\/a&gt;/g, '<a href="$1" rel="nofollow">$2</a>');

        return '<p>' +  str.replace(/<p>/g, '</p><p>') + '</p>';
    };
})

;
