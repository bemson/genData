/*!
 * genData @ https://github.com/bemson/genData
 * | by Bemi Faison
 * | MIT license
 *
 * **genData** generates normalized datasets and funcions that curry customizations and extend the prototype-chain.
 *
 * We start by adding `genData` to the (global) window object, or exporting it for commonjs environments. The genData "library" is just a function, and omits the conventional self-executing closure, in favor of performance and because the behavior is functioinal enough to omit private variables.
 */
(typeof exports !== 'undefined' ? exports : window).genData = function (stuff) {
/**
 * Declare all necessary variables. Most of these are placeholders.
 *
 * The `arguments` object is aliased for minification purposes (mostly). The dataModel serves as the prototype to extend or use, and is the `genData` function by default - which can be overriden by the incoming arguments.
 */
  var
    currentParserIndex
    , dataInstance
    , memberName
    , parentRef
    , parserFlags
    , queue
    , queueBuffer
    , queueItem
    , totalParsers
    , sharedVars = {}
    , parsers = []
    , dataset = []
    , args = arguments
    , origFnc = args.callee
    , dataModel = origFnc
  ;
  /**
  * genData forks it's behavior based on whether or not it was invoked with or without the `new` statement.
  */
  if (!(this instanceof origFnc)) {
    /**
     * When invoked without the `new` statement, genData will assume it's normalization role.
     *
     * This functional form handles the following argument signatures:
     *
     * 1. `var dataset1 = genData(stuff);`
     * 2. `var dataset2 = genData(stuff, parsers);`
     * 3. `var dataset3 = genData(stuff, parsers, dataModel);`
     *
     * **stuff** is any JavaScript value (including null). genData will recursively iterate and parse the non-inherited members of this argument.
     * 
     * **parsers**
     *
     * One or more functions (i.e., an _array_ of functions) that will parse each object member.
     * 
     * **dataModel**
     *
     * A function, who's prototype is applied to each resulting object parsed.
     */
    // if there is a second argument...
    if (args[1]) {
      // capture as a collection of parsers - ensure it's an array of functions, even when given one function
      parsers = typeof args[1] === 'function' ? [args[1]] : args[1];
    }
    // capture the number of parsers
    totalParsers = parsers.length;
    // if a second argument is present...
    if (args[2]) {
      // capture as the function prototype for the resulting parsed objects
      dataModel = args[2];
    }
    /**
     * The default klass for data objects, parsed while iterating and normalizing.
     *
     * The structure of a _genData_ data object is simple: the name and value to be parsed.
     *
     * By default, the prototype to this klass is genData's. When passed a function as a third argument, it's prototype is used instead.
     */
    function Data(name, value) {
      this.name = name;
      this.value = value;
    }
    // use the given or default prototype
    Data.prototype = typeof dataModel === 'function' ? dataModel.prototype : dataModel;

    /**
     * The queue is an array of parameter configurations (another array). The parameters are those needed when instantiating a Data instance; _name_ and _value_. The initial parameter-set is an empty name and the original value to be normalized.
     */
    queue = [
      [
        '', // _name_ passed to "new Data()"
        stuff // _value_ passed to "new Data()"
      ]
    ];
    /**
     * This is the iteration loop that continues until the `queue` array is empty.
     */
    while (queue.length) {
     /**
     * The loop begins by removing the first parameter-set from the queue, and using that information to initialize a data object.
     * This data object will serve as the scope when invoking the parsers passed in this genData call. We reset a variable that tracks the current parser, for each newly defined data object.
     */
      queueItem = queue.shift();
      dataInstance = new Data(queueItem[0], queueItem[1]);
      currentParserIndex = 0;
      /**
       * Here we setup the arguments that will be passed to all the parsers. The `parserFlags` object is critical, as it allows parser functions to control how and what is processed _next_ in the queue. The `parserFlags` object is passed to each parser (in a larger collection of arguments. Below are the keys and their impact on the iteration process.
       *
       * - **omit**: A booly flag that indicates when the private data object should be excluded from the resulting data set.
       * - **scan**: A booly flag that indicates whether members of the current data object should be added to the queue.
       * - **exit**: A booly flag that indicates when the queue should be abandoned.
       * - **parent**: An object to use as the parent argument, when processing any members of the current data object.
       */
      parserFlags = {
        // falsy, by default
        omit: 0
        // truthy, by default
        , scan: 1
        // falsy, by default
        , exit: 0
        // instructs genData to use the data object as the parent, by default
        , parent: 0
      };
      /**
       * Here we define an array of arguments, that are passed to each parser function. Below are the parameters names and argument values passed to parser functions.
       *
       * 1. **name** A string representing the original value of the scope/data object's `.name` property.
       * 2. **value** A JavaScript value representing the original value of the scope/data object's `.value` property.
       * 3. **parent** An object representing the container for the name-value pair that defines the scope/data object.
       * 4. **dataset** The final array that will be returned by the orginal genData call.
       * 5. **flags** An object whose key/value pairs control genData's iteration and parisng behavior.
       * 6. **shared** An object whose key/value pairs are preserved between processing each data object.
       */
      args = [
        // the orginal name
        queueItem[0]
        // the original value
        , queueItem[1]
        // the parent to the scope/data object
        , queueItem[2]
        // the array returned by genData
        , dataset
        // a collection of parser flags
        , parserFlags
        // an object, preserved between iterations
        , sharedVars
      ];
      /**
       * Now we begin another loop to invoke each parser function. This loop continues until all parsers are invoked, or the `parserFlags.exit` is true.
       *
       * After parsing the data object, we observe the `parserFlags`.
       */
      while (currentParserIndex < totalParsers && !parserFlags.exit) {
        // invoke each parser with the data object as it's scope, and the predefined arguments
        parsers[currentParserIndex++].apply(dataInstance, args);
      }
      /**
       * The "omit" flag determines whether the original data object will be added to the dataset.
       *
       * (Omitted data objects are tagged, in case they are referenced later.)
       */
      // if omitting this data object...
      if (parserFlags.omit) {
        // tag this instance, in case it is used later
        dataInstance._OMIT = true;
      } else { // (otherwise) when including this data object...
        // add this object to the dataset
        dataset.push(dataInstance);
      }
      /**
       * The "exit" flag determines when to stop processing the queue.
       *
       * When truthy, the `queue` array is emptied, which will cause the iteration loop to exit.
       */
      // if exiting...
      if (parserFlags.exit) {
        // clear the queue
        queue = [];
      /**
       * When the "exit" flag is falsy, continue parsing this data object.
       *
       * The "scan" flag determines whether the members of the final value should also be scanned. If so, all non-inherited members are add to a temporary `queueBuffer` array, which is ultimately added to the original queue.
       *
       * We also capture the parent in the queue. That is, the object containing the found members - unless an override object is given by `parentFlags.parent`.
       */
      } else { // (otherwise) when not exiting the queue-processing loop...
        // reset the queueBuffer
        queueBuffer = [];
        // if allowed to scan this object...
        if (parserFlags.scan && typeof dataInstance.value === 'object') {
          // resolve what object will be given to parser functions, as the parent paraneter
          parentRef = typeof parserFlags.parent === 'object' ? parserFlags.parent : dataInstance;
          // with each member of the object...
          for (memberName in dataInstance.value) {
            // if the member is not-inherited...
            if (dataInstance.value.hasOwnProperty(memberName)) {
              // add to the temporary queue buffer
              queueBuffer.push([
                // the _name_ argument for a new Data object
                memberName
                // the _value_ argument for a new Data object
                , dataInstance.value[memberName]
                // the parent argument passed to parsers
                , parentRef
              ]);
            }
          }
        }
        // prepend the existing queue with these "child" members of the current data object
        queue = queueBuffer.concat(queue);
      }
    /**
     * Ultimately, when iterating and parsing an object, genData will return an array, called the dataset.
     */
    }
    return dataset;
  /**
   * When genData is called with the `new` operator _and_ given an argument, it returns a curried `genData` function that also extends the prototype chain, called a "generator". Generators behave exactly like the genData function, which means that generators can spawn generators. This lets you compound various parser combinations and branch specific prototype chains.
   *
   * The following signatures spawn a generator (from either genData or an existing generator):
   *
   * 1. `var generator1 = new genData(dataModel, parsers);`
   * 2. `var generator2 = new genData(parser [, parser]);`
   *
   * The first form requires **parsers** to be an array, in order for the first argument to be recognized as **dataModel**. If one or more functions are given, they will all be considered individual parser functions.
   *
   * _Note:_ The signature validation for this use of genData (and generator functions) is weak.
   */
  } else if (stuff) { // or, when called with `new` and given any argument...
    // if the second argument is an array...
    if (~{}.toString.call(args[1]).indexOf('y')) {
      // assume the first argument is a function
      dataModel = stuff;
      // assume the second argument is an array of parser functions
      args = args[1];
    }
    // capture and ensure that parsers is an array (since args may be the raw arguments object)
    parsers = parsers.concat([].slice.call(args));
    /**
     * This is the curry function returned when spawning a generator.
     * 
     * The function mimics genData's forking logic, based on it's signature, then calls genData with it's curried arguments. Each generator spawned will extend the prototype chain of the previous generator. This allows you to prototype methods to all generators when spawned from genData (i.e., without passing in your own constructor).
     *
     * **Example:**
     *
     * This example demonstrates how dataset objects, from generators, share the **genData** prototype chain. (This example assumes that `myParser` and `anotherParser` are pre-existing functions.)
     *
     *    var
     *      genFoo = new genData(myParser)
     *      , fooSet = genFoo('anything')
     *      , genBar = new genData(anotherParser)
     *      , barSet = genBar('something else')
     *    ;
     *    genData.prototype.hello = function () {return 'hello world'};
     *    return typeof barSet[0].hello === 'function' && barSet[0].hello === 'function'; // true
     *    
     */
    function Generator(stuff, moreParsers, newModel) {
      var
        // flag when the second argument is an array
        moreParsersIsArray = ~{}.toString.call(moreParsers).indexOf('y')
      ;
      // if called without the `new` statement...
      if (!(this instanceof Generator)) {
        // return result of calling genData with the curried arguments
        return origFnc(
          // the data to parse
          stuff,
          // combine the curried parsers with any additional parsers
          parsers.concat(moreParsers || []),
          // use the given function or this function's prototype
          newModel ? newModel : Generator
        );
      } else if (stuff) { // or, when called with the `new` statement and given an argument...
        // return result of spawning a generator with the curried arguments
        return new origFnc(
          // use the given function or this function's prototype
          moreParsersIsArray ? stuff : Generator,
          // combine the curried parsers with any additional parsers
          parsers.concat(
            // when adding an array to the curried parsers...
            moreParsersIsArray ? 
              // add it directly
              moreParsers :
              // otherwise, consider all the arguments to be parsers and add them to the curried parsers
              [].slice.call(arguments)
          )
        );
      }
      // otherwise, return standard instance from invoking a constructor with the `new` statement
      return this;
    }
    // extend the dataModel when it's a function, otherwise just point to it
    Generator.prototype = typeof dataModel === 'function' ? new dataModel() : dataModel;
    // return the curry function
    return Generator;
  }
  /**
   * This code block is reached when genData is invoked with the `new` statement, but not given any arguments. The returned instance mimics the behavior expected when initializing an object with a regular constructor function.
   *
   * This behavior exists so that we can extend genData's protoype chain - traditional chaining requires instantiating the constructor.
   */
  return this;
};