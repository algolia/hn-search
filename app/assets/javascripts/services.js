angular.module('HNSearch.services', ['ngStorage'])

.factory('story', function() {
    var story = [];
    var storyService = {};
    storyService.set = function(hit) {
        story = hit;
    };
    storyService.get = function() {
        return story;
    };
    return storyService;
})

.factory('settings', function() {
    //default settings
    var defaultSettings = {
        dateRange: 'last24h',
        type: 'story',
        sort: 'byDate',
        category: null
    };
    var settings = {};
    var settingsService = {};

    settingsService.init = function(category) {
        settings = angular.copy(defaultSettings);
        settings.category = category;
        return settings;
    };
    settingsService.set = function(settings) {
        settings = settings;
        return settings;
    };
    settingsService.get = function() {
        return settings;
    };
    return settingsService;
})

.factory('search', function() {
    var searchService = {
        query: '',
        params: {}
    };

    //dates
    var last24h = new Date();
    var pastWeek = new Date();
    var pastMonth = new Date();
    last24h = last24h.setDate(last24h.getDate() - 1) / 1000;
    pastWeek = pastWeek.setDate(pastWeek.getDate() - 7) / 1000;
    pastMonth = pastMonth.setDate(pastMonth.getDate() - 31) / 1000;

    searchService.setQuery = function(query) {
        this.query = query;
    };

    searchService.applySettings = function(settings) {
        this.params.tagFilters = [];

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
        switch (settings.category) {
        case 'ask-hn':
            this.params.tagFilters.push('ask_hn');
            break;
        case 'show-hn':
            this.params.tagFilters.push('show_hn');
            break;
        case 'jobs':
            this.params.tagFilters.push('job');
            break;
        }

        // item type
        if (settings.type && settings.category !== 'jobs') {
            this.params.tagFilters.push(settings.type);
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
                }
                res.tagFilters.push(stories);
            }
        }

        return res;
    };

    return searchService;
})


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
});
