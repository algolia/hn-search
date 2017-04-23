/******/ (function(modules) { // webpackBootstrap
/******/  // The module cache
/******/  var installedModules = {};
/******/
/******/  // The require function
/******/  function __webpack_require__(moduleId) {
/******/
/******/    // Check if module is in cache
/******/    if(installedModules[moduleId])
/******/      return installedModules[moduleId].exports;
/******/
/******/    // Create a new module (and put it into the cache)
/******/    var module = installedModules[moduleId] = {
/******/      i: moduleId,
/******/      l: false,
/******/      exports: {}
/******/    };
/******/
/******/    // Execute the module function
/******/    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/    // Flag the module as loaded
/******/    module.l = true;
/******/
/******/    // Return the exports of the module
/******/    return module.exports;
/******/  }
/******/
/******/
/******/  // expose the modules object (__webpack_modules__)
/******/  __webpack_require__.m = modules;
/******/
/******/  // expose the module cache
/******/  __webpack_require__.c = installedModules;
/******/
/******/  // identity function for calling harmony imports with the correct context
/******/  __webpack_require__.i = function(value) { return value; };
/******/
/******/  // define getter function for harmony exports
/******/  __webpack_require__.d = function(exports, name, getter) {
/******/    if(!__webpack_require__.o(exports, name)) {
/******/      Object.defineProperty(exports, name, {
/******/        configurable: false,
/******/        enumerable: true,
/******/        get: getter
/******/      });
/******/    }
/******/  };
/******/
/******/  // getDefaultExport function for compatibility with non-harmony modules
/******/  __webpack_require__.n = function(module) {
/******/    var getter = module && module.__esModule ?
/******/      function getDefault() { return module['default']; } :
/******/      function getModuleExports() { return module; };
/******/    __webpack_require__.d(getter, 'a', getter);
/******/    return getter;
/******/  };
/******/
/******/  // Object.prototype.hasOwnProperty.call
/******/  __webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/  // __webpack_public_path__
/******/  __webpack_require__.p = "/frontend/";
/******/
/******/  // Load entry module and return exports
/******/  return __webpack_require__(__webpack_require__.s = 113);
/******/ })
/************************************************************************/
/******/ ({

/***/ 113:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.attributedRelevance = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cookieUtils = __webpack_require__(24);

var _parametersCheck = __webpack_require__(37);

var _bindSettings = __webpack_require__(30);

var _storeQuery = __webpack_require__(40);

var _considerQueryNonRelevant = __webpack_require__(31);

var _windowLeaveHandler = __webpack_require__(41);

var _getClickedNode = __webpack_require__(32);

var _sendReport = __webpack_require__(39);

var _mouseHandlers = __webpack_require__(36);

var _inputHandlers = __webpack_require__(35);

var _getClickedObject = __webpack_require__(33);

var _getPaginationOffset = __webpack_require__(34);

var _resetQuery = __webpack_require__(38);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

window.attributedRelevance = function () {
  function attributedRelevance(_ref) {
    var hitsContainer = _ref.hitsContainer,
        inputSelector = _ref.inputSelector,
        instantsearch = _ref.instantsearch,
        options = _ref.options;

    _classCallCheck(this, attributedRelevance);

    // Validate params
    var validateParams = (0, _parametersCheck.validateMandatoryParameters)(hitsContainer, inputSelector);
    // Save instantsearch instance
    this.instantsearch = instantsearch;

    // Save nodes
    this.hitsContainerNode = validateParams.hitsNode;
    this.inputNode = validateParams.inputNode;

    // Bind imported functions to `this` context
    this.getPaginationOffset = _getPaginationOffset.getPaginationOffset.bind(this);
    this.getClickedObject = _getClickedObject.getClickedObject.bind(this);
    this.considerQueryNonRelevant = _considerQueryNonRelevant.considerQueryNonRelevant.bind(this);
    this.bindSettings = _bindSettings.bindSettings.bind(this);
    this.storeQuery = _storeQuery.storeQuery.bind(this);
    this.handleWindowLeave = _windowLeaveHandler.handleWindowLeave.bind(this);
    this.didClickOnResults = _getClickedNode.didClickOnResults.bind(this);
    this.onMouseMove = _mouseHandlers.onMouseMove.bind(this);
    this.disableMouseMove = _mouseHandlers.disableMouseMove.bind(this);
    this.onInputBlur = _inputHandlers.onInputBlur.bind(this);
    this.onInputFocus = _inputHandlers.onInputFocus.bind(this);
    this.sendReport = _sendReport.sendReport.bind(this);
    this.resetData = _resetQuery.resetData.bind(this);

    // Bind setings
    this.bindSettings(options);

    // Bind class functions
    this.saveResults = this.saveResults.bind(this);
    this.initRelevancy = this.initRelevancy.bind(this);

    // Store timeout ID
    this.endedTypingTimeoutID = null;

    // Init
    this.initRelevancy();
  }

  // Initialise


  _createClass(attributedRelevance, [{
    key: 'initRelevancy',
    value: function initRelevancy() {
      // StoreQuery on search
      this.inputNode.addEventListener('input', this.storeQuery);
      // Handle input focus
      this.inputNode.addEventListener('focus', this.onInputFocus);
      // Handle input blur
      this.inputNode.addEventListener('blur', this.onInputBlur);

      // Store First query
      this.storeQuery();

      // On leave handler
      if (window && typeof window.addEventListener === "function") {
        window.addEventListener('beforeunload', this.handleWindowLeave);
      }
      // Click handler
      if (document && typeof document.addEventListener === "function") {
        document.addEventListener('click', this.didClickOnResults);
      }
    }

    // Save results

  }, {
    key: 'saveResults',
    value: function saveResults(results) {
      // Save details and results
      this.queryDetails = results;
      this.searchResults = results ? results.hits : null;
    }
  }]);

  return attributedRelevance;
}();

exports.attributedRelevance = attributedRelevance;

/***/ }),

/***/ 24:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

/**
 * Check if user is returning 
 * @return {[string]} new or returning UUID
 */
function checkUserIdCookie() {
    // Check for existing cookie
    // const UUID = getCookie("__alr_UUID") || null;

    // Return existing UUID
    // if(UUID) return UUID;

    // User has no previous UUID.
    // generate new
    // if(!UUID){
    var newUUID = createUUID();
    // setCookie("__alr_UUID", newUUID ,365);
    return newUUID;
    // }
}

/**
 * Create UUID according to
 * https://www.ietf.org/rfc/rfc4122.txt
 * @return {[string]} generated UUID
 */
function createUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    });
}

/**
 * Set cookie
 * @param {[string]} cname  
 * @param {[type]} cvalue
 * @param {[int]} exdays 
 */
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";";
}

/**
 * Set cookie
 * @param  {[type]} cname [description]
 * @return {[type]}       [description]
 */
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

exports.checkUserIdCookie = checkUserIdCookie;

/***/ }),

/***/ 30:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bindSettings = undefined;

var _cookieUtils = __webpack_require__(24);

/**
 * Binds settings to context
 * @return {[type]} [description]
 */
function bindSettings() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  // Get UUID
  this.UUID = (0, _cookieUtils.checkUserIdCookie)();
  // Array of search results
  this.searchResults = [];
  // Typing timeout - consider query non relevant after that
  this.typingTimeToConfirmed = 1200 || options.timeoutTime;
  // Current query
  this.currentQuery = "";
  // Previos query
  this.previousQuery = "";
  // Clicked object ID
  this.clickedObjectID = null;
  // Application ID
  this.applicationID = options.applicationID || "";
  // IndexName
  this.indexName = options.indexName || "";

  /**
   * Set of options to determine if
   * user has seen the results
   */

  // User interacted with input
  this.userInteractedWithInput = false;
  // Clicked node position - 0 based
  this.clickedNodeIndex = null;
  // Consider results as viewed
  this.considerViewedResults = false;
  // Moved mouse after query
  this.didMoveMouseAfterQuery = null;
  // Left screen without clicking
  this.navigatedWithoutClicking = false;

  // Final bool before sending results if query was irrelevant 
  this.queryWasNonRelevant = null;
}

exports.bindSettings = bindSettings;

/***/ }),

/***/ 31:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Set of checks to determine if query was non relevant
 * @return {[type]} [description]
 */
function considerQueryNonRelevant() {
  /**
   * case #1:
   * Timeout after last keystroke expired (1200ms default)
   */
  if (this.considerViewedResults) {
    this.queryWasNonRelevant = true;
  }
  /**
   * case #2:
   * User navigated without clicking
   */
  else if (this.navigatedWithoutClicking) {
      this.queryWasNonRelevant = true;
    }
    /**
     * case #3:
     * User moved mouse after query (likely finished typing)
     */
    else if (this.didMoveMouseAfterQuery) {
        this.queryWasNonRelevant = true;
      }

  if (this.queryWasNonRelevant) {
    this.sendReport();
  }
}

exports.considerQueryNonRelevant = considerQueryNonRelevant;

/***/ }),

/***/ 32:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * GetClickedNode position
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function didClickOnResults(e) {
  var hitsNode = void 0;
  var node = e.target;

  // Loop over parents to get index
  while (node !== document.body && node.parentNode) {

    if (node.parentNode.classList && node.parentNode.classList.contains(this.hitsContainerNode)) {
      // get clickedNode Index
      this.clickedNodeIndex = Array.from(node.parentNode.children).indexOf(node) + 1;
      // Set navigatedWithout clicking to false
      this.navigatedWithoutClicking = false;
      // Check if there is an algolia object id on element
      var DOMObjectID = node ? node.getAttribute('algolia-object-id') : null;
      // If there is an id save it
      if (DOMObjectID !== null) {
        this.clickedObjectID = DOMObjectID;
      }
      // Send report
      this.sendReport();
    }
    // ^^ loop ^^
    node = node.parentNode;
  }
}

exports.didClickOnResults = didClickOnResults;

/***/ }),

/***/ 33:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Returns clicked object
 * @return {[type]} [description]
 */
function getClickedObject() {
  // Normalize to index in array
  var clickedNodeIndex = this.clickedNodeIndex - 1;
  // If hits exist
  if (this.searchResults.length && this.searchResults.length > 0) {
    // We have results
    var clickedHit = this.searchResults[clickedNodeIndex] || null;
    // Check array boundary
    if (clickedHit !== null) {
      return clickedHit;
    }
  } else if (this.clickedObjectID !== null) {
    return {
      objectID: this.clickedObjectID
    };
  }

  return {
    objectID: null
  };
}

exports.getClickedObject = getClickedObject;

/***/ }),

/***/ 34:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Get pagination offset
 * @return {[type]} [description]
 */
function getPaginationOffset() {
  // Check if queryDetails exist
  if (this.queryDetails !== null && this.queryDetails !== undefined) {
    // Get query details
    var _queryDetails = this.queryDetails,
        page = _queryDetails.page,
        hitsPerPage = _queryDetails.hitsPerPage;

    // Check type before multiplying

    if (typeof page === "number" && typeof hitsPerPage === "number") {
      // Calculate offset
      var offset = page * hitsPerPage;
      // Return total position and current page
      return {
        totalPosition: offset,
        page: page
      };
    } else {
      // Fallback return NaN
      return {
        totalPosition: NaN,
        page: NaN
      };
    }
  } else {
    return {
      totalPosition: NaN,
      page: NaN
    };
  }
}

exports.getPaginationOffset = getPaginationOffset;

/***/ }),

/***/ 35:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * [onInputBlur description]
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
function onInputBlur(event) {
  this.disableMouseMove();
}

/**
 * [onInputFocus description]
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
function onInputFocus(event) {
  this.onMouseMove();
}

exports.onInputBlur = onInputBlur;
exports.onInputFocus = onInputFocus;

/***/ }),

/***/ 36:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Detect user mouse move after query
 * @return {[type]} [description]
 */
function onMouseMove() {
  if (this.didMoveMouseAfterQuery) {
    this.disableMouseMove();
  } else if (this.currentQuery !== "" && this.currentQuery !== null) {
    this.didMoveMouseAfterQuery = true;
  }
}

/**
 * Disable mouse move 
 * @return {[type]} [description]
 */
function disableMouseMove() {
  window.removeEventListener('mousemove', this.onMouseMove);
}

exports.onMouseMove = onMouseMove;
exports.disableMouseMove = disableMouseMove;

/***/ }),

/***/ 37:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * checkNode if it's a valid dom element or string
 * @param  {[type]} documentNodeOrString node or querySelectorString
 * @return {[type]} node
 */
function checkNode(documentNodeOrString, nodeName) {
  var node = void 0;
  if (typeof documentNodeOrString === "string") {
    node = document.querySelector(documentNodeOrString) || null;
    if (node === null) {
      throw new Error(nodeName + ' is not a valid DOM selector');
    }
  } else if (documentNodeOrString.nodeName === null || documentNodeOrString.nodeName === undefined) {
    throw new Error(nodeName + ' is not a valid DOM node');
  } else {
    node = documentNodeOrString;
  }
  return node;
}

/**
 * Validate that hitsContainer and inputSelector exist
 * @param  {[type]} hitsContainer [description]
 * @param  {[type]} inputSelector [description]
 * @return {[type]}               [description]
 */
var validateMandatoryParameters = function validateMandatoryParameters(hitsContainer, inputSelector) {
  // Exit if hitsContainer || inputSelector are null
  if (hitsContainer === null) {
    throw new Error('Parameter hitsContainer is null, please check that you are specifying the right query selector or node');
  }
  if (inputSelector === null) {
    throw new Error('Parameter inputSelector is null, please check that you are specifying the right query selector or node');
  }

  // Check hits
  // const hitsNode = checkNode(hitsContainer, 'hitsContainer');

  // Check input
  var inputNode = checkNode(inputSelector, 'inputNode');

  // Return nodes
  return { hitsNode: hitsContainer, inputNode: inputNode };
};

exports.validateMandatoryParameters = validateMandatoryParameters;

/***/ }),

/***/ 38:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Reset query
 * @return {[type]} [description]
 */
function resetData() {
  // User interacted with input
  this.userInteractedWithInput = false;
  // Clicked node position - 0 based
  this.clickedNodeIndex = null;
  // Consider results as viewed
  this.considerViewedResults = false;
  // Moved mouse after query
  this.didMoveMouseAfterQuery = null;
  // Left screen without clicking
  this.navigatedWithoutClicking = false;
  // Final bool before sending results if query was irrelevant 
  this.queryWasNonRelevant = null;
}

exports.resetData = resetData;

/***/ }),

/***/ 39:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Send results to endpoint
 */
function sendReport() {
  // Calculate final position
  var clickedResult = this.getClickedObject();
  var paginationOffset = this.getPaginationOffset();

  // Create query
  var reportData = {
    position: this.clickedNodeIndex,
    query: this.currentQuery,
    totalPosition: paginationOffset.totalPosition,
    page: paginationOffset.page,
    objectID: clickedResult.objectID,
    UUID: this.UUID,
    applicationID: this.applicationID,
    indexName: this.indexName
  };

  // Abort if data for this query was already sent
  if (this.lastSentReportForQuery === reportData.query) {
    return false;
  }

  // Check if reportData has position
  if (reportData.position === null) {
    // user didn't click - send previous query!
    reportData.query = this.previousQuery;
  }

  // Set last report for query
  this.lastSentReportForQuery = reportData.query;

  // Serialize query
  var serializedReportData = '?' + Object.keys(reportData).reduce(function (a, k) {
    a.push(k + '=' + encodeURIComponent(reportData[k]));return a;
  }, []).join('&');

  // Construct get string
  var reportingQuery = 'https://relevancy-experiment.algolia.com/1/store' + serializedReportData;
  // Open request
  var report = new XMLHttpRequest();
  report.open('GET', reportingQuery, false);
  report.send();

  // Reset data
  this.resetData();
}

exports.sendReport = sendReport;

/***/ }),

/***/ 40:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Store query
 * @param  {[type]} s [description]
 * @return {[type]}   [description]
 */
function storeQuery(s) {
  var _this = this;

  // Store query
  this.previousQuery = this.currentQuery;
  this.currentQuery = s && s.query ? s.query : this.inputNode.value || null;

  // Clear current expire interval
  if (this.endedTypingTimeoutID !== null) {
    window.clearInterval(this.endedTypingTimeoutID);
  }

  if (this.currentQuery !== null && this.currentQuery !== "") {
    this.endedTypingTimeoutID = setTimeout(function () {
      _this.considerViewedResults = true;
    }, this.typingTimeToConfirmed);
  }

  // Consider if query should be sent
  this.considerQueryNonRelevant();
}

exports.storeQuery = storeQuery;

/***/ }),

/***/ 41:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * [handleWindowLeave description]
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
function handleWindowLeave(event) {
  this.sendReport();
}

exports.handleWindowLeave = handleWindowLeave;

/***/ })

/******/ });
//# sourceMappingURL=attributedRelevancy.js.map