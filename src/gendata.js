/*!
 * genData v3.1.0
 * https://github.com/bemson/genData
 *
 * Copyright 2012, Bemi Faison
 * Released under the MIT License
 */
!function (inCJS, inAMD, Array, scope, undefined) {

  function initGenData() {

    var
      protoSliceMethod = Array.prototype.slice,
      isArray = Array.isArray || function (thing) {return thing instanceof Array;}
    ;

    function filterFunctions(thing) {
      return typeof thing === 'function';
    }

    function filterNonFunctions(thing) {
      return typeof thing !== 'function';
    }

    /*
      Index and iterate over object members.
    */
    function genData(stuff) {
      // return instance when called with new
      if (this instanceof genData) {
        return this;
      }

      var
        queue = [
          [
            '',
             stuff
          ]
        ],
        queueBuffer,
        queueItem,
        invocationArgs = protoSliceMethod.call(arguments),
        mainArgs = invocationArgs.slice(1),
        loopEnv,
        finalCallbackReturnValue,
        callbacks = mainArgs.filter(filterFunctions),
        callbackResult,
        callbackArgs,
        callbackScope,
        callbackIdx,
        sourceKey,
        hasFinalReturnValue,
        resultsArray = [],
        totalCallbacks = callbacks.length
      ;

      // short-circuit zero callbacks
      if (!totalCallbacks) {
        return [];
      }

      // generic data constructor and prototype
      function Data(name, value) {
        this.name = name;
        this.value = value;
      }
      Data.prototype = (typeof this === 'function' ? this : genData).prototype;

      // init loop environment
      loopEnv = {
        returns: resultsArray,
        args: mainArgs.filter(filterNonFunctions),
        params: invocationArgs,
        loop: 0,
        queued: 0
      };

      while (queue.length) {
        queueItem = queue.shift();
        callbackScope = new Data(queueItem[0], queueItem[1]);

        callbackIdx = hasFinalReturnValue = 0;

        // define parser arguments
        callbackArgs = [
          queueItem[0], // name
          queueItem[1], // value
          queueItem[2], // parent
          loopEnv       // loop variables
        ];

        // init loop environment iteration flags
        loopEnv.continues = 0;
        loopEnv.breaks = 0;
        loopEnv.source = queueItem[1];

        // while there are parsers to process this data and the continues flag allows...
        while (!loopEnv.continues && callbackIdx < totalCallbacks) {
          loopEnv.allowUndefined = 0;
          callbackResult = callbacks[callbackIdx++].apply(callbackScope, callbackArgs);
          if (callbackResult !== undefined || loopEnv.allowUndefined) {
            finalCallbackReturnValue = callbackResult;
            hasFinalReturnValue = 1;
          }
        }

        // add final value to the results array
        if (hasFinalReturnValue) {
          resultsArray.push(finalCallbackReturnValue);
        }

        // stop iterating
        if (loopEnv.breaks) {
          break;
        }

        // add source members to the queue
        if (typeof loopEnv.source === 'object') {
          queueBuffer = [];
          for (sourceKey in loopEnv.source) {
            if (loopEnv.source.hasOwnProperty(sourceKey)) {
              queueBuffer.push([
                sourceKey,
                loopEnv.source[sourceKey],
                callbackScope
              ]);
            }
          }
          queue = queueBuffer.concat(queue);
        }
        loopEnv.loop++;
        loopEnv.queued = queue.length - 1;
      }
      return loopEnv.hasOwnProperty('returns') ? loopEnv.returns : resultsArray;
    }

    /*
      Define a curried function that extends the prototype
    */
    genData.spawn = function spawn() {
      var
        parentFunction = this,
        curriedArgs = protoSliceMethod.call(arguments).filter(filterFunctions)
      ;

      // curry and extend prototype of parent functio call to parent function and extend it's prototype
      function spawnedFunction(stuff) {
        // return instance when called with new
        if (this instanceof spawnedFunction) {
          return this;
        }

        // call parent function with curried callbacks
        return parentFunction.apply(
          typeof this === 'function' ? this : spawnedFunction,
          [stuff].concat(curriedArgs, protoSliceMethod.call(arguments).slice(1))
        );
      }
      spawnedFunction.prototype = new parentFunction();

      // append spawn method to curried function
      spawnedFunction.spawn = spawn;

      return spawnedFunction;
    };

    genData.version = '3.1.0';

    return genData;
  }

  // initialize genData, based on the environment
  if (inAMD) {
    define(initGenData);
  } else if (inCJS) {
    module.exports = initGenData();
  } else if (!scope.genData) {
    scope.genData = initGenData();
  }
}(
  typeof exports != 'undefined',
  typeof define == 'function',
  Array, this
);