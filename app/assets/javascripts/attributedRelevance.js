/******/ (function(modules) { // webpackBootstrap
/******/  function hotDisposeChunk(chunkId) {
/******/    delete installedChunks[chunkId];
/******/  }
/******/  var parentHotUpdateCallback = this["webpackHotUpdate"];
/******/  this["webpackHotUpdate"] = 
/******/  function webpackHotUpdateCallback(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/    hotAddUpdateChunk(chunkId, moreModules);
/******/    if(parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
/******/  } ;
/******/  
/******/  function hotDownloadUpdateChunk(chunkId) { // eslint-disable-line no-unused-vars
/******/    var head = document.getElementsByTagName("head")[0];
/******/    var script = document.createElement("script");
/******/    script.type = "text/javascript";
/******/    script.charset = "utf-8";
/******/    script.src = __webpack_require__.p + "" + chunkId + "." + hotCurrentHash + ".hot-update.js";
/******/    head.appendChild(script);
/******/  }
/******/  
/******/  function hotDownloadManifest() { // eslint-disable-line no-unused-vars
/******/    return new Promise(function(resolve, reject) {
/******/      if(typeof XMLHttpRequest === "undefined")
/******/        return reject(new Error("No browser support"));
/******/      try {
/******/        var request = new XMLHttpRequest();
/******/        var requestPath = __webpack_require__.p + "" + hotCurrentHash + ".hot-update.json";
/******/        request.open("GET", requestPath, true);
/******/        request.timeout = 10000;
/******/        request.send(null);
/******/      } catch(err) {
/******/        return reject(err);
/******/      }
/******/      request.onreadystatechange = function() {
/******/        if(request.readyState !== 4) return;
/******/        if(request.status === 0) {
/******/          // timeout
/******/          reject(new Error("Manifest request to " + requestPath + " timed out."));
/******/        } else if(request.status === 404) {
/******/          // no update available
/******/          resolve();
/******/        } else if(request.status !== 200 && request.status !== 304) {
/******/          // other failure
/******/          reject(new Error("Manifest request to " + requestPath + " failed."));
/******/        } else {
/******/          // success
/******/          try {
/******/            var update = JSON.parse(request.responseText);
/******/          } catch(e) {
/******/            reject(e);
/******/            return;
/******/          }
/******/          resolve(update);
/******/        }
/******/      };
/******/    });
/******/  }
/******/
/******/  
/******/  
/******/  var hotApplyOnUpdate = true;
/******/  var hotCurrentHash = "05ba7b63f43a767b35f9"; // eslint-disable-line no-unused-vars
/******/  var hotCurrentModuleData = {};
/******/  var hotMainModule = true; // eslint-disable-line no-unused-vars
/******/  var hotCurrentParents = []; // eslint-disable-line no-unused-vars
/******/  var hotCurrentParentsTemp = []; // eslint-disable-line no-unused-vars
/******/  
/******/  function hotCreateRequire(moduleId) { // eslint-disable-line no-unused-vars
/******/    var me = installedModules[moduleId];
/******/    if(!me) return __webpack_require__;
/******/    var fn = function(request) {
/******/      if(me.hot.active) {
/******/        if(installedModules[request]) {
/******/          if(installedModules[request].parents.indexOf(moduleId) < 0)
/******/            installedModules[request].parents.push(moduleId);
/******/        } else hotCurrentParents = [moduleId];
/******/        if(me.children.indexOf(request) < 0)
/******/          me.children.push(request);
/******/      } else {
/******/        console.warn("[HMR] unexpected require(" + request + ") from disposed module " + moduleId);
/******/        hotCurrentParents = [];
/******/      }
/******/      hotMainModule = false;
/******/      return __webpack_require__(request);
/******/    };
/******/    var ObjectFactory = function ObjectFactory(name) {
/******/      return {
/******/        configurable: true,
/******/        enumerable: true,
/******/        get: function() {
/******/          return __webpack_require__[name];
/******/        },
/******/        set: function(value) {
/******/          __webpack_require__[name] = value;
/******/        }
/******/      };
/******/    };
/******/    for(var name in __webpack_require__) {
/******/      if(Object.prototype.hasOwnProperty.call(__webpack_require__, name)) {
/******/        Object.defineProperty(fn, name, ObjectFactory(name));
/******/      }
/******/    }
/******/    Object.defineProperty(fn, "e", {
/******/      enumerable: true,
/******/      value: function(chunkId) {
/******/        if(hotStatus === "ready")
/******/          hotSetStatus("prepare");
/******/        hotChunksLoading++;
/******/        return __webpack_require__.e(chunkId).then(finishChunkLoading, function(err) {
/******/          finishChunkLoading();
/******/          throw err;
/******/        });
/******/  
/******/        function finishChunkLoading() {
/******/          hotChunksLoading--;
/******/          if(hotStatus === "prepare") {
/******/            if(!hotWaitingFilesMap[chunkId]) {
/******/              hotEnsureUpdateChunk(chunkId);
/******/            }
/******/            if(hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/              hotUpdateDownloaded();
/******/            }
/******/          }
/******/        }
/******/      }
/******/    });
/******/    return fn;
/******/  }
/******/  
/******/  function hotCreateModule(moduleId) { // eslint-disable-line no-unused-vars
/******/    var hot = {
/******/      // private stuff
/******/      _acceptedDependencies: {},
/******/      _declinedDependencies: {},
/******/      _selfAccepted: false,
/******/      _selfDeclined: false,
/******/      _disposeHandlers: [],
/******/      _main: hotMainModule,
/******/  
/******/      // Module API
/******/      active: true,
/******/      accept: function(dep, callback) {
/******/        if(typeof dep === "undefined")
/******/          hot._selfAccepted = true;
/******/        else if(typeof dep === "function")
/******/          hot._selfAccepted = dep;
/******/        else if(typeof dep === "object")
/******/          for(var i = 0; i < dep.length; i++)
/******/            hot._acceptedDependencies[dep[i]] = callback || function() {};
/******/        else
/******/          hot._acceptedDependencies[dep] = callback || function() {};
/******/      },
/******/      decline: function(dep) {
/******/        if(typeof dep === "undefined")
/******/          hot._selfDeclined = true;
/******/        else if(typeof dep === "object")
/******/          for(var i = 0; i < dep.length; i++)
/******/            hot._declinedDependencies[dep[i]] = true;
/******/        else
/******/          hot._declinedDependencies[dep] = true;
/******/      },
/******/      dispose: function(callback) {
/******/        hot._disposeHandlers.push(callback);
/******/      },
/******/      addDisposeHandler: function(callback) {
/******/        hot._disposeHandlers.push(callback);
/******/      },
/******/      removeDisposeHandler: function(callback) {
/******/        var idx = hot._disposeHandlers.indexOf(callback);
/******/        if(idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/      },
/******/  
/******/      // Management API
/******/      check: hotCheck,
/******/      apply: hotApply,
/******/      status: function(l) {
/******/        if(!l) return hotStatus;
/******/        hotStatusHandlers.push(l);
/******/      },
/******/      addStatusHandler: function(l) {
/******/        hotStatusHandlers.push(l);
/******/      },
/******/      removeStatusHandler: function(l) {
/******/        var idx = hotStatusHandlers.indexOf(l);
/******/        if(idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/      },
/******/  
/******/      //inherit from previous dispose call
/******/      data: hotCurrentModuleData[moduleId]
/******/    };
/******/    hotMainModule = true;
/******/    return hot;
/******/  }
/******/  
/******/  var hotStatusHandlers = [];
/******/  var hotStatus = "idle";
/******/  
/******/  function hotSetStatus(newStatus) {
/******/    hotStatus = newStatus;
/******/    for(var i = 0; i < hotStatusHandlers.length; i++)
/******/      hotStatusHandlers[i].call(null, newStatus);
/******/  }
/******/  
/******/  // while downloading
/******/  var hotWaitingFiles = 0;
/******/  var hotChunksLoading = 0;
/******/  var hotWaitingFilesMap = {};
/******/  var hotRequestedFilesMap = {};
/******/  var hotAvailableFilesMap = {};
/******/  var hotDeferred;
/******/  
/******/  // The update info
/******/  var hotUpdate, hotUpdateNewHash;
/******/  
/******/  function toModuleId(id) {
/******/    var isNumber = (+id) + "" === id;
/******/    return isNumber ? +id : id;
/******/  }
/******/  
/******/  function hotCheck(apply) {
/******/    if(hotStatus !== "idle") throw new Error("check() is only allowed in idle status");
/******/    hotApplyOnUpdate = apply;
/******/    hotSetStatus("check");
/******/    return hotDownloadManifest().then(function(update) {
/******/      if(!update) {
/******/        hotSetStatus("idle");
/******/        return null;
/******/      }
/******/  
/******/      hotRequestedFilesMap = {};
/******/      hotWaitingFilesMap = {};
/******/      hotAvailableFilesMap = update.c;
/******/      hotUpdateNewHash = update.h;
/******/  
/******/      hotSetStatus("prepare");
/******/      var promise = new Promise(function(resolve, reject) {
/******/        hotDeferred = {
/******/          resolve: resolve,
/******/          reject: reject
/******/        };
/******/      });
/******/      hotUpdate = {};
/******/      var chunkId = 3;
/******/      { // eslint-disable-line no-lone-blocks
/******/        /*globals chunkId */
/******/        hotEnsureUpdateChunk(chunkId);
/******/      }
/******/      if(hotStatus === "prepare" && hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/        hotUpdateDownloaded();
/******/      }
/******/      return promise;
/******/    });
/******/  }
/******/  
/******/  function hotAddUpdateChunk(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/    if(!hotAvailableFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/      return;
/******/    hotRequestedFilesMap[chunkId] = false;
/******/    for(var moduleId in moreModules) {
/******/      if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/        hotUpdate[moduleId] = moreModules[moduleId];
/******/      }
/******/    }
/******/    if(--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/      hotUpdateDownloaded();
/******/    }
/******/  }
/******/  
/******/  function hotEnsureUpdateChunk(chunkId) {
/******/    if(!hotAvailableFilesMap[chunkId]) {
/******/      hotWaitingFilesMap[chunkId] = true;
/******/    } else {
/******/      hotRequestedFilesMap[chunkId] = true;
/******/      hotWaitingFiles++;
/******/      hotDownloadUpdateChunk(chunkId);
/******/    }
/******/  }
/******/  
/******/  function hotUpdateDownloaded() {
/******/    hotSetStatus("ready");
/******/    var deferred = hotDeferred;
/******/    hotDeferred = null;
/******/    if(!deferred) return;
/******/    if(hotApplyOnUpdate) {
/******/      hotApply(hotApplyOnUpdate).then(function(result) {
/******/        deferred.resolve(result);
/******/      }, function(err) {
/******/        deferred.reject(err);
/******/      });
/******/    } else {
/******/      var outdatedModules = [];
/******/      for(var id in hotUpdate) {
/******/        if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/          outdatedModules.push(toModuleId(id));
/******/        }
/******/      }
/******/      deferred.resolve(outdatedModules);
/******/    }
/******/  }
/******/  
/******/  function hotApply(options) {
/******/    if(hotStatus !== "ready") throw new Error("apply() is only allowed in ready status");
/******/    options = options || {};
/******/  
/******/    var cb;
/******/    var i;
/******/    var j;
/******/    var module;
/******/    var moduleId;
/******/  
/******/    function getAffectedStuff(updateModuleId) {
/******/      var outdatedModules = [updateModuleId];
/******/      var outdatedDependencies = {};
/******/  
/******/      var queue = outdatedModules.slice().map(function(id) {
/******/        return {
/******/          chain: [id],
/******/          id: id
/******/        };
/******/      });
/******/      while(queue.length > 0) {
/******/        var queueItem = queue.pop();
/******/        var moduleId = queueItem.id;
/******/        var chain = queueItem.chain;
/******/        module = installedModules[moduleId];
/******/        if(!module || module.hot._selfAccepted)
/******/          continue;
/******/        if(module.hot._selfDeclined) {
/******/          return {
/******/            type: "self-declined",
/******/            chain: chain,
/******/            moduleId: moduleId
/******/          };
/******/        }
/******/        if(module.hot._main) {
/******/          return {
/******/            type: "unaccepted",
/******/            chain: chain,
/******/            moduleId: moduleId
/******/          };
/******/        }
/******/        for(var i = 0; i < module.parents.length; i++) {
/******/          var parentId = module.parents[i];
/******/          var parent = installedModules[parentId];
/******/          if(!parent) continue;
/******/          if(parent.hot._declinedDependencies[moduleId]) {
/******/            return {
/******/              type: "declined",
/******/              chain: chain.concat([parentId]),
/******/              moduleId: moduleId,
/******/              parentId: parentId
/******/            };
/******/          }
/******/          if(outdatedModules.indexOf(parentId) >= 0) continue;
/******/          if(parent.hot._acceptedDependencies[moduleId]) {
/******/            if(!outdatedDependencies[parentId])
/******/              outdatedDependencies[parentId] = [];
/******/            addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/            continue;
/******/          }
/******/          delete outdatedDependencies[parentId];
/******/          outdatedModules.push(parentId);
/******/          queue.push({
/******/            chain: chain.concat([parentId]),
/******/            id: parentId
/******/          });
/******/        }
/******/      }
/******/  
/******/      return {
/******/        type: "accepted",
/******/        moduleId: updateModuleId,
/******/        outdatedModules: outdatedModules,
/******/        outdatedDependencies: outdatedDependencies
/******/      };
/******/    }
/******/  
/******/    function addAllToSet(a, b) {
/******/      for(var i = 0; i < b.length; i++) {
/******/        var item = b[i];
/******/        if(a.indexOf(item) < 0)
/******/          a.push(item);
/******/      }
/******/    }
/******/  
/******/    // at begin all updates modules are outdated
/******/    // the "outdated" status can propagate to parents if they don't accept the children
/******/    var outdatedDependencies = {};
/******/    var outdatedModules = [];
/******/    var appliedUpdate = {};
/******/  
/******/    var warnUnexpectedRequire = function warnUnexpectedRequire() {
/******/      console.warn("[HMR] unexpected require(" + result.moduleId + ") to disposed module");
/******/    };
/******/  
/******/    for(var id in hotUpdate) {
/******/      if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/        moduleId = toModuleId(id);
/******/        var result;
/******/        if(hotUpdate[id]) {
/******/          result = getAffectedStuff(moduleId);
/******/        } else {
/******/          result = {
/******/            type: "disposed",
/******/            moduleId: id
/******/          };
/******/        }
/******/        var abortError = false;
/******/        var doApply = false;
/******/        var doDispose = false;
/******/        var chainInfo = "";
/******/        if(result.chain) {
/******/          chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/        }
/******/        switch(result.type) {
/******/          case "self-declined":
/******/            if(options.onDeclined)
/******/              options.onDeclined(result);
/******/            if(!options.ignoreDeclined)
/******/              abortError = new Error("Aborted because of self decline: " + result.moduleId + chainInfo);
/******/            break;
/******/          case "declined":
/******/            if(options.onDeclined)
/******/              options.onDeclined(result);
/******/            if(!options.ignoreDeclined)
/******/              abortError = new Error("Aborted because of declined dependency: " + result.moduleId + " in " + result.parentId + chainInfo);
/******/            break;
/******/          case "unaccepted":
/******/            if(options.onUnaccepted)
/******/              options.onUnaccepted(result);
/******/            if(!options.ignoreUnaccepted)
/******/              abortError = new Error("Aborted because " + moduleId + " is not accepted" + chainInfo);
/******/            break;
/******/          case "accepted":
/******/            if(options.onAccepted)
/******/              options.onAccepted(result);
/******/            doApply = true;
/******/            break;
/******/          case "disposed":
/******/            if(options.onDisposed)
/******/              options.onDisposed(result);
/******/            doDispose = true;
/******/            break;
/******/          default:
/******/            throw new Error("Unexception type " + result.type);
/******/        }
/******/        if(abortError) {
/******/          hotSetStatus("abort");
/******/          return Promise.reject(abortError);
/******/        }
/******/        if(doApply) {
/******/          appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/          addAllToSet(outdatedModules, result.outdatedModules);
/******/          for(moduleId in result.outdatedDependencies) {
/******/            if(Object.prototype.hasOwnProperty.call(result.outdatedDependencies, moduleId)) {
/******/              if(!outdatedDependencies[moduleId])
/******/                outdatedDependencies[moduleId] = [];
/******/              addAllToSet(outdatedDependencies[moduleId], result.outdatedDependencies[moduleId]);
/******/            }
/******/          }
/******/        }
/******/        if(doDispose) {
/******/          addAllToSet(outdatedModules, [result.moduleId]);
/******/          appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/        }
/******/      }
/******/    }
/******/  
/******/    // Store self accepted outdated modules to require them later by the module system
/******/    var outdatedSelfAcceptedModules = [];
/******/    for(i = 0; i < outdatedModules.length; i++) {
/******/      moduleId = outdatedModules[i];
/******/      if(installedModules[moduleId] && installedModules[moduleId].hot._selfAccepted)
/******/        outdatedSelfAcceptedModules.push({
/******/          module: moduleId,
/******/          errorHandler: installedModules[moduleId].hot._selfAccepted
/******/        });
/******/    }
/******/  
/******/    // Now in "dispose" phase
/******/    hotSetStatus("dispose");
/******/    Object.keys(hotAvailableFilesMap).forEach(function(chunkId) {
/******/      if(hotAvailableFilesMap[chunkId] === false) {
/******/        hotDisposeChunk(chunkId);
/******/      }
/******/    });
/******/  
/******/    var idx;
/******/    var queue = outdatedModules.slice();
/******/    while(queue.length > 0) {
/******/      moduleId = queue.pop();
/******/      module = installedModules[moduleId];
/******/      if(!module) continue;
/******/  
/******/      var data = {};
/******/  
/******/      // Call dispose handlers
/******/      var disposeHandlers = module.hot._disposeHandlers;
/******/      for(j = 0; j < disposeHandlers.length; j++) {
/******/        cb = disposeHandlers[j];
/******/        cb(data);
/******/      }
/******/      hotCurrentModuleData[moduleId] = data;
/******/  
/******/      // disable module (this disables requires from this module)
/******/      module.hot.active = false;
/******/  
/******/      // remove module from cache
/******/      delete installedModules[moduleId];
/******/  
/******/      // remove "parents" references from all children
/******/      for(j = 0; j < module.children.length; j++) {
/******/        var child = installedModules[module.children[j]];
/******/        if(!child) continue;
/******/        idx = child.parents.indexOf(moduleId);
/******/        if(idx >= 0) {
/******/          child.parents.splice(idx, 1);
/******/        }
/******/      }
/******/    }
/******/  
/******/    // remove outdated dependency from module children
/******/    var dependency;
/******/    var moduleOutdatedDependencies;
/******/    for(moduleId in outdatedDependencies) {
/******/      if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/        module = installedModules[moduleId];
/******/        if(module) {
/******/          moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/          for(j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/            dependency = moduleOutdatedDependencies[j];
/******/            idx = module.children.indexOf(dependency);
/******/            if(idx >= 0) module.children.splice(idx, 1);
/******/          }
/******/        }
/******/      }
/******/    }
/******/  
/******/    // Not in "apply" phase
/******/    hotSetStatus("apply");
/******/  
/******/    hotCurrentHash = hotUpdateNewHash;
/******/  
/******/    // insert new code
/******/    for(moduleId in appliedUpdate) {
/******/      if(Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/        modules[moduleId] = appliedUpdate[moduleId];
/******/      }
/******/    }
/******/  
/******/    // call accept handlers
/******/    var error = null;
/******/    for(moduleId in outdatedDependencies) {
/******/      if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/        module = installedModules[moduleId];
/******/        moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/        var callbacks = [];
/******/        for(i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/          dependency = moduleOutdatedDependencies[i];
/******/          cb = module.hot._acceptedDependencies[dependency];
/******/          if(callbacks.indexOf(cb) >= 0) continue;
/******/          callbacks.push(cb);
/******/        }
/******/        for(i = 0; i < callbacks.length; i++) {
/******/          cb = callbacks[i];
/******/          try {
/******/            cb(moduleOutdatedDependencies);
/******/          } catch(err) {
/******/            if(options.onErrored) {
/******/              options.onErrored({
/******/                type: "accept-errored",
/******/                moduleId: moduleId,
/******/                dependencyId: moduleOutdatedDependencies[i],
/******/                error: err
/******/              });
/******/            }
/******/            if(!options.ignoreErrored) {
/******/              if(!error)
/******/                error = err;
/******/            }
/******/          }
/******/        }
/******/      }
/******/    }
/******/  
/******/    // Load self accepted modules
/******/    for(i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/      var item = outdatedSelfAcceptedModules[i];
/******/      moduleId = item.module;
/******/      hotCurrentParents = [moduleId];
/******/      try {
/******/        __webpack_require__(moduleId);
/******/      } catch(err) {
/******/        if(typeof item.errorHandler === "function") {
/******/          try {
/******/            item.errorHandler(err);
/******/          } catch(err2) {
/******/            if(options.onErrored) {
/******/              options.onErrored({
/******/                type: "self-accept-error-handler-errored",
/******/                moduleId: moduleId,
/******/                error: err2,
/******/                orginalError: err
/******/              });
/******/            }
/******/            if(!options.ignoreErrored) {
/******/              if(!error)
/******/                error = err2;
/******/            }
/******/            if(!error)
/******/              error = err;
/******/          }
/******/        } else {
/******/          if(options.onErrored) {
/******/            options.onErrored({
/******/              type: "self-accept-errored",
/******/              moduleId: moduleId,
/******/              error: err
/******/            });
/******/          }
/******/          if(!options.ignoreErrored) {
/******/            if(!error)
/******/              error = err;
/******/          }
/******/        }
/******/      }
/******/    }
/******/  
/******/    // handle errors in accept handlers and self accepted module load
/******/    if(error) {
/******/      hotSetStatus("fail");
/******/      return Promise.reject(error);
/******/    }
/******/  
/******/    hotSetStatus("idle");
/******/    return Promise.resolve(outdatedModules);
/******/  }
/******/
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
/******/      exports: {},
/******/      hot: hotCreateModule(moduleId),
/******/      parents: (hotCurrentParentsTemp = hotCurrentParents, hotCurrentParents = [], hotCurrentParentsTemp),
/******/      children: []
/******/    };
/******/
/******/    // Execute the module function
/******/    modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
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
/******/  __webpack_require__.p = "/";
/******/
/******/  // __webpack_hash__
/******/  __webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/  // Load entry module and return exports
/******/  return hotCreateRequire(112)(__webpack_require__.s = 112);
/******/ })
/************************************************************************/
/******/ ({

/***/ 112:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _parametersCheck = __webpack_require__(36);

var _bindSettings = __webpack_require__(29);

var _storeQuery = __webpack_require__(39);

var _considerQueryNonRelevant = __webpack_require__(30);

var _windowLeaveHandler = __webpack_require__(40);

var _getClickedNode = __webpack_require__(31);

var _sendReport = __webpack_require__(38);

var _mouseHandlers = __webpack_require__(35);

var _inputHandlers = __webpack_require__(34);

var _getClickedObject = __webpack_require__(32);

var _getPaginationOffset = __webpack_require__(33);

var _resetQuery = __webpack_require__(37);

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

/***/ }),

/***/ 29:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Binds settings to context
 * @return {[type]} [description]
 */
function bindSettings(options) {
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

/***/ 30:
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

/***/ 31:
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
      var DOMObjectID = node.firstChild ? node.firstChild.getAttribute('algolia-object-id') : null;
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

/***/ 32:
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

/***/ 33:
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
    // Get etails
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
        totalPosition: "NaN",
        page: "NaN"
      };
    }
  } else {
    return {
      totalPosition: "NaN",
      page: "NaN"
    };
  }
}

exports.getPaginationOffset = getPaginationOffset;

/***/ }),

/***/ 34:
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

/***/ 35:
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

/***/ 36:
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

/***/ 37:
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

/***/ 38:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Send results to endpoint
 * @return {[type]} [description]
 */
function sendReport() {
  // Calculate final position
  var clickedResult = this.getClickedObject();
  var paginationOffset = this.getPaginationOffset();

  // Create query
  var ci = this.clickedNodeIndex;
  var tp = paginationOffset.totalPosition + ci;
  var p = paginationOffset.page;
  var q = this.currentQuery;

  if (ci === null) {
    // user didn't click - send previous query!
    q = this.previousQuery;
  }

  // Abort if data for this query was already sent
  if (this.lastSentReportForQuery === q) {
    return false;
  }

  this.lastSentReportForQuery = q;

  var reportingQuery = 'https://relevancy-experiment.algolia.com/1/store?query=' + q + '&page=' + p + '&totalPosition=' + tp + '&position=' + ci + '&objectID=' + clickedResult.objectID;
  // Open request
  var report = new XMLHttpRequest();
  report.open('GET', reportingQuery);
  report.send();

  // Reset data
  this.resetData();
}

exports.sendReport = sendReport;

/***/ }),

/***/ 39:
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

/***/ 40:
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