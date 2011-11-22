/*!
 * genData @ https://github.com/bemson/genData
 * by Bemi Faison
 * MIT license
 * **genData** generates normalized datasets and functions that encapsulate customizations while extending the prototype-chain.
 */
/**
 * Define genData in the global scope, or export as a module if we're in a commonjs environment.
 *
 * This function forks it's behavior when called with the `new` statement.
 */
(typeof exports !== 'undefined' ? exports : window).genData = function(stuff) {
/**
 * Declare all variables, most of which are placeholders.
 */
  var args = arguments,
    origFnc = args.callee,
    parserFlags,
    currentParserIndex,
    totalParsers,
    memberName,
    parsers = [],
    dataset = [],
    parentRef,
    sharedVars = {},
    queue,
    queueBuffer,
    queueItem,
    dataModel = origFnc,
    isDataModelConstructor = typeof dataModel === 'function',
    dataInstance;
/**
 * When invoked without the `new` operator, genData presumes it will normalize `stuff` and return a dataset.
 */
  if (!(this instanceof origFnc)) {
    /**
     * Handles the following argument signatures:
     *
     * 1. `genData([stuff])`
     * 2. `genData(stuff, parser)`
     * 3. `genData(stuff, parser, dataModel)`
     * 4. `genData(stuff, parsersArray)`
     * 5. `genData(stuff, parsersArray, dataModel)`
     */
    if (args[1]) {
      parsers = typeof args[1] === 'function' ? [args[1]] : args[1];
    }
    totalParsers = parsers.length;
    if (args[2]) {
      dataModel = args[2];
    }
    /**
     * Define an anonymous Data constructor.
     *
     * Set the prototype to the resolved dataModel (genData by default).
     */
    function Data(name, value) {
      this.name = name;
      this.value = value;
    }
    Data.prototype = isDataModelConstructor ? dataModel.prototype : dataModel;

    /**
     * Queue an array of parameters, needed to instantiate a Data object.
     */
    queue = [
      [
        '', // _name_ passed to "new Data()"
        stuff // _value_ passed to "new Data()"
      ]
    ];
    /**
     * Begin the main processing/normalization loop, and continue until `queue` is empty.
     *
     * Each loop begins with removing an item from the queue, defining a Data instance from it, and resetting loop variables - used when invoking each parser function.
     */
    while (queue.length) {
      queueItem = queue.shift();
      dataInstance = new Data(queueItem[0], queueItem[1]);
      currentParserIndex = 0;
      /**
       * Reset the flags object passed to _parser_ functions.
       *
       * - **parent**: When a data object, the instance to parent any scanned and queued properties
       * - **omit**: When truthy, the data object is excluded from the dataset
       * - **scan**: When falsy, members of the data object are not processed
       * - **exit**: When truthy, genData stops processing the queue
       */
      parserFlags = {
        parent: 0, // auto, by default
        omit: 0, // false, by default
        scan: 1, // truthy, by default
        exit: 0 // falsy, by default
      };
      /**
       * Define the arguments for all _parsers_.
       *
       * 1. Original data name
       * 2. Original data value
       * 3. The parent data object (if any)
       * 4. The dataset array
       * 5. The flags object
       */
      args = [
        dataInstance.name, // a string
        dataInstance.value, // mixed type
        queueItem[2], // a data object
        dataset, // an array
        parserFlags, // an object
        sharedVars // shared variable container
      ];
      /**
       * Now pass arguments to each parser, unless one trips the "exit" flag.
       */
      while (currentParserIndex < totalParsers && !parserFlags.exit) {
        parsers[currentParserIndex++].apply(dataInstance, args);
      }
      /**
       * Observe the "omit" flag, to determine whether `data` will be returned with the dataset.
       *
       * (Excluded data objects are tagged, in case they are referenced later.)
       */
      if (parserFlags.omit) {
        dataInstance._OMIT = true;
      } else {
        dataset.push(dataInstance);
      }
      // if exiting...
      /**
       * Observe the "exit" flag, which - when truthy - aborts processing the queue...
       */
      if (parserFlags.exit) {
        // clear the queue
        queue = [];
      }
      /**
       * If falsy, we next observe the "scan" flag, queuing parameters of future Data objects, for each non-inherited member from the current data object's value.
       *
       * A temporary buffer queues these members in first-to-last order.
       */
      else {
        queueBuffer = [];
        if (parserFlags.scan && typeof dataInstance.value === 'object') {
          parentRef = typeof parserFlags.parent === 'object' ? parserFlags.parent : dataInstance;
          for (memberName in dataInstance.value) {
            if (dataInstance.value.hasOwnProperty(memberName)) {
              queueBuffer.push([
                memberName, // _name_ passed to "new Data()"
                dataInstance.value[memberName], // _value_ passed to "new Data()"
                parentRef // _parent_ (argument [2]) passed to parsers
              ]);
            }
          }
        }
        queue = queueBuffer.concat(queue);
      }
    /**
     * Wrap up the queue-loop, and return the resulting dataset
     */
    }
    return dataset;
  }
  /**
   * When called with `new` and passed an argument, genData returns a _generator_, or curried function.
   */
  else if (stuff) {
    /**
     * Handles the following argument signatures:
     *
     * 1. `new genData(dataModel, parsersArray)`
     * 2. `new genData(parser1 [, parserN])`
     */
    if (~{}.toString.call(args[1]).indexOf('y')) {
      dataModel = stuff;
      args = args[1];
    }
    parsers = parsers.concat([].slice.call(args));
    /**
     * Define a curry-like function that mimics genData's forking logic.
     * Ultimately, this curry-like function calls genData to do the actual normalization.
     */
    function Generator(stuff, moreParsers, newModel) {
      var moreParsersIsArray = ~{}.toString.call(moreParsers).indexOf('y');
      if (!(this instanceof Generator)) {
        return origFnc(
          stuff,
          parsers.concat(moreParsers || []),
          newModel ? newModel : Generator
        );
      } else if (stuff) {
        return new origFnc(
          moreParsersIsArray ? stuff : Generator,
          parsers.concat(
            moreParsersIsArray ? 
            moreParsers :
            [].slice.call(arguments)
          )
        );
      }
      return this;
    }
    /**
     * Chain this function to a given prototype, and return it as a genData _generator_.
     */
    Generator.prototype = isDataModelConstructor ? new dataModel() : dataModel;
    return Generator;
  }
  /**
   * Finally, if invoked with `new` but given no arguments, we return an instance of genData.
   * This signature would be used for prototyping chaining.
   */
  return this;
};