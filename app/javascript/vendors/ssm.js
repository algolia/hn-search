/*global window document clearTimeout setTimeout */

(function (window, document, undefined, factory) {
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return factory(window, document, undefined);
    });
  } else if (typeof exports === 'object') {
    module.exports = factory;
  } else {
    window.ssm = factory(window, document, undefined);
  }
})(window, document, undefined, function (window, document, undefined) {
    "use strict";

    var isReady = false,
        ssm = {},
        states = [],
        browserWidth = 0,
        currentStates = [],
        resizeTimeout = 10,
        resizeTimer = null,
        configOptions = [];


    //The returned value never changes so is self executing
    var testForMatchMedia = function(){
        if(typeof window.matchMedia === "function"){
            if(typeof window.matchMedia('(width: 100px)').addListener !== "undefined"){
                return true;
            }
        }

        return false;
    }();

    var browserResizeDebounce = function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(browserResizeWrapper, resizeTimeout);
    };

    //Added wrapper for the resize method
    var browserResizeWrapper = function() {
        browserWidth = getWidth();
        browserResize(browserWidth);
    };

    var browserResize = function (localBrowserWidth) {
        var totalStates = states.length,
            totalConfigOptions = configOptions.length,
            leaveMethods = [],
            resizeMethods = [],
            enterMethods = [],
            setupMethods = [],
            validState = true,
            tempObj = ssm;

        for (var i = 0; i < totalStates; i++) {
            
            validState = true;
            tempObj.state = states[i];
            tempObj.browserWidth = localBrowserWidth;

            for (var j = 0; j < totalConfigOptions; j++) {
                //Skip any config options the state does not define
                if(typeof tempObj.state[configOptions[j].name] !== "undefined"){
                    tempObj.callback = configOptions[j].test;
                    if(tempObj.callback() === false){
                        validState = false;
                        break;
                    }
                }
            }

            if(validState){

                //Run any run once methods
                setupMethods = setupMethods.concat(states[i].onFirstRun);

                //Clear run once method array
                states[i].onFirstRun = [];
                
                if(objectInArray(currentStates, states[i])){
                    resizeMethods = resizeMethods.concat(states[i].onResize);
                }
                else{
                    currentStates.push(states[i]);
                    enterMethods = enterMethods.concat(states[i].onEnter);
                }
            }
            else{
                if(objectInArray(currentStates, states[i])){
                    leaveMethods = leaveMethods.concat(states[i].onLeave);
                    currentStates = removeObjectInArray(currentStates,states[i]);
                }
            }
        }

        fireAllMethodsInArray(setupMethods);
        fireAllMethodsInArray(leaveMethods);
        fireAllMethodsInArray(enterMethods);
        fireAllMethodsInArray(resizeMethods);
    };

    ssm.browserResize = browserResize;

    ssm.getBrowserWidth = function(){
        return browserWidth;
    };

    //Add a new state
    ssm.addState = function (options) {
        //Setting sensible defaults for a state
        //Max width is set to 99999 for comparative purposes, is bigger than any display on market
        var defaultOptions = {
            id: makeID(),
            minWidth: 0,
            maxWidth: 999999,
            onEnter: [],
            onLeave: [],
            onResize: [],
            onFirstRun: []
        };

        //Merge options with defaults
        options = mergeOptions(defaultOptions, options);

        //Migrate methods into an array
        if(typeof options.onEnter === "function"){
            options.onEnter = [options.onEnter];
        }

        if(typeof options.onLeave === "function"){
            options.onLeave = [options.onLeave];
        }

        if(typeof options.onResize === "function"){
            options.onResize = [options.onResize];
        }

        if(typeof options.onFirstRun === "function"){
            options.onFirstRun = [options.onFirstRun];
        }

        //Add state to the master states array
        states.push(options);

        //Sort 
        states = sortByKey(states, "minWidth");

        return this;
    };

    //Allow updating of an already added state
    ssm.updateState = function (stateId, options) {
        for (var i = states.length - 1; i >= 0; i--) {
            if (states[i].id === stateId) {
                states[i] = mergeOptions(states[i], options);
            }
        }

        return this;
    };

    //Find and remove the state from the array
    ssm.removeState = function (stateId) {
        for (var i = states.length - 1; i >= 0; i--) {
            if (states[i].id === stateId) {
                states.splice(i, 1);
            }
        }

        return this;
    };

    //Remove multiple states from an array
    ssm.removeStates = function (statesArray) {
        for (var i = statesArray.length - 1; i >= 0; i--) {
            ssm.removeState(statesArray[i]);
        }

        return this;
    };

    //Find and remove the state from the array
    ssm.removeAllStates = function () {
        states = currentStates = [];

        return this;
    };

    //Add multiple states from an array
    ssm.addStates = function (statesArray) {
        for (var i = statesArray.length - 1; i >= 0; i--) {
            ssm.addState(statesArray[i]);
        }

        return this;
    };

    ssm.getStates = function(idArr){
        var idCount = null, returnArr = [];

        if(typeof(idArr) === "undefined"){
            return states;
        }
        else{
            idCount = idArr.length;
            
            for (var i = 0; i < idCount; i++) {
                returnArr.push(getStateByID(idArr[i]));
            }

            return returnArr;
        }
    };

    ssm.addConfigOption = function(options){
        var defaultOptions = {
            name: "",
            test: null
        };

        //Merge options with defaults
        options = mergeOptions(defaultOptions, options);

        if(options.name !== "" && options.test !== null){
            configOptions.push(options);
        }
    };

    ssm.getConfigOption = function(name){
        if(typeof name === "string"){
            for (var i = configOptions.length - 1; i >= 0; i--) {
                if(configOptions[i].name === name){
                    return configOptions[i];
                }
            }
        }
        else{
            return configOptions;
        }
    };

    ssm.removeConfigOption = function(name){
        for (var i = configOptions.length - 1; i >= 0; i--) {
            if (configOptions[i].name === name) {
                configOptions.splice(i, 1);
            }
        }
    };

    ssm.isActive = function(name){
        for (var i = 0; i < currentStates.length; i++) {
            if(currentStates[i].id === name){
                return true;
            }
        }
        
        return false;
    };

    ssm.getCurrentStates = function(){
        return currentStates;
    };

    //Change the timeout before firing the resize function
    ssm.setResizeTimeout = function (milliSeconds) {
        resizeTimeout = milliSeconds;
    };

    //Change the timeout before firing the resize function
    ssm.getResizeTimeout = function () {
        return resizeTimeout;
    };

    ssm.ready = function () {
        //Update browser width
        browserWidth = getWidth();

        if(isReady === false){
            //Attach event for resizing
            if (window.attachEvent) {
                window.attachEvent("onresize", browserResizeDebounce);
            } else if (window.addEventListener) {
                window.addEventListener("resize", browserResizeDebounce, true);
            }

            isReady = true;
        }

        browserResize(browserWidth);

        return this;
    };

    var makeID = function () {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 10; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

    var getWidth = function () {
        var x = 0;

        if(testForMatchMedia){

            //Browsers that support match media we will test our method does same as media queries
            if(window.matchMedia('(width:'+window.innerWidth+'px)').matches){
                x = window.innerWidth;
            }
            else if(window.matchMedia('(width:'+window.outerWidth+'px)').matches){
                x = window.outerWidth;
            }
            else if(window.matchMedia('(width:'+document.body.clientWidth+'px)').matches){
                x = document.body.clientWidth;
            }
        }
        else if (typeof(document.body.clientWidth) === "number") {
            // newest gen browsers
            x = document.body.clientWidth;
        }
        else if( typeof( window.innerWidth ) === "number" ) {
            x = window.innerWidth;
        }
        else if( document.documentElement && document.documentElement.clientWidth ) {
            //IE 6+ in 'standards compliant mode'
            x = document.documentElement.clientWidth;
        }

        return x;
    };


    var mergeOptions = function (obj1, obj2) {
        var obj3 = {};

        for (var attrname in obj1) {
            obj3[attrname] = obj1[attrname];
        }

        for (var attrname2 in obj2) {
            obj3[attrname2] = obj2[attrname2];
        }

        return obj3;
    };


    var sortByKey = function (array, key) {
        return array.sort(function (a, b) {
            var x = a[key];
            var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    };

    //Method to get a state based on the ID
    var getStateByID = function(id){
        for (var i = states.length - 1; i >= 0; i--) {
            if(states[i].id === id){
                return states[i];
            }
        }
    };

    var objectInArray = function(arr, obj){
        for (var i = 0; i < arr.length; i++) {
            if(arr[i] === obj){
                return true;
            }
        }
    };

    var removeObjectInArray = function(arr,obj){
        var length = arr.length;

        for (var i = 0; i < length; i++) {
            if (arr[i] === obj) {
                arr.splice(i, 1);
            }
        }

        return arr;
    };

    var fireAllMethodsInArray = function(arr){
        var arrLength = arr.length;

        for (var i = 0; i < arrLength; i++) {
            arr[i]();
        }
    };

    //define the built in methods (required for compatabilty)
    ssm.addConfigOption({name:"minWidth", test: function(){
        if(typeof this.state.minWidth === "number" && this.state.minWidth <= this.browserWidth){
            return true;
        }
        else{
            return false;
        }
    }});

    ssm.addConfigOption({name:"maxWidth", test: function(){
        if(typeof this.state.maxWidth === "number" && this.state.maxWidth >= this.browserWidth){
            return true;
        }
        else{
            return false;
        }
    }});

    return ssm;

});
