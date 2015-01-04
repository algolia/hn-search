angular.module('HNSearch.services', [])

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
        console.log(settings, defaultSettings);
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

        // item type
        if (settings.type) {
            this.params.tagFilters.push(settings.type);
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

        return this.params;
    };

    searchService.getParams = function() {
        return this.params;
    };

    return searchService;
})


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
