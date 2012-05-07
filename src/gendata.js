/*!
 * genData @ https://github.com/bemson/genData
 * by Bemi Faison
 * MIT license
 *
 * **genData** generates normalized datasets and generator functions; functions that curry parser configurations and extend the prototype-chain.
 *
 */
((typeof exports !== 'undefined' ? exports : window).genData = function genData(stuff) {
  // if called with `new`...
  if (this instanceof genData) {
    // do nothing
    return this;
  }

  var
    // the index of the parser function to invoke
    parserIdx
    // the data instance to be parsed
    , data
    // the name of a member property's name/value pair
    , propertyName
    // the collection of configuration-like objects, describing the name, value, and parent-object to be added to the dataset
    , queue = [
      [
        // name of first queued item is always an empty string
        ''
        // the first queued item is the value passed in to this function
        , stuff
        // since there is no parent to this first item, the third element-index is omitted
      ]
    ]
    // the object to be scanned in order to add items to the queue
    , nextObj
    // flag when the "parent" value should be the next scanned object
    , useParentFlagForNextObject
    // a buffered collection of queue item
    , queueBuffer
    // an item from the queued
    , item
    // an object where parsers can store values between iterations
    , sharedVars = {}
    // parser flags per loop iteration
    , parserFlags
    // parser arguments
    , parserArgs
    // collection of parser functions, starting with all arguments...
    , parsers = [].slice.call(arguments)
      // ... except the first
      .slice(1)
      // ... and only functions
      .filter(function (fnc) {
        // include when the value is a function
        return typeof fnc === 'function';
      })
    // total number of parsers
    , totalParsers = parsers.length
    // the dataset (an array) to return from this function call
    , dataset = []
  ;

  // the constructor for generic data objects
  function Data(name, value) {
    this.name = name;
    this.value = value;
  }
  // the Data constructor uses the scope's prototype - when it is a function - or the default/base genData prototype
  Data.prototype = (typeof this === 'function' ? this : genData).prototype;

  // until the queue is complete...
  while (queue.length) {
    // get next queued item
    item = queue.shift();
    // initialize a data object using the queued name and value
    data = new Data(item[0], item[1]);
    // reset the parser index
    parserIdx = 0;
    // reset parser flags
    parserFlags = {
      // falsy, by default
      omit: 0
      // truthy, by default
      , scan: 1
      // falsy, by default
      , exit: 0
      // placeholder for an object that genData should use as the parent for the next
      // in place of it's default instructs genData to use the data object as the parent, by default
      , parent: 0
    };
    // define parser arguments
    parserArgs = [
      // the orginal name
      item[0]
      // the original value
      , item[1]
      // the parent to the scope/data object
      , item[2]
      // the array returned by genData
      , dataset
      // a collection of parser flags
      , parserFlags
      // an object, preserved between iterations
      , sharedVars
    ];
    // while there are parsers to process this data and the exit flag allows...
    while (parserIdx < totalParsers && !parserFlags.exit) {
      // invoke each parser with the data object as it's scope, and the predefined arguments
      parsers[parserIdx++].apply(data, parserArgs);
    }
    // if omitting this data object...
    if (parserFlags.omit) {
      // tag the instance, in case it is used later
      data._OMIT = true;
    } else { // (otherwise) when not omitting this data object...
      // add the object to the dataset
      dataset.push(data);
    }
    // if exiting...
    if (parserFlags.exit) {
      // clear the queue
      queue = [];
    } else { // (otherwise) when not exiting the queue-processing loop...
      // reset the queueBuffer
      queueBuffer = [];
      // flag whether to use the parent object
      useParentFlagForNextObject = typeof parserFlags.parent === 'object';
      // resolve what object will be considered the parent object (for the next parser function)
      nextObj = useParentFlagForNextObject ? parserFlags.parent : data.value;
      // if allowed to scan the next object...
      if (parserFlags.scan && typeof nextObj === 'object') {
        // with each member of the object...
        for (propertyName in nextObj) {
          // if the member is not-inherited...
          if (nextObj.hasOwnProperty(propertyName)) {
            // add to the temporary queue buffer
            queueBuffer.push([
              // the _name_ argument for a new Data object
              propertyName
              // the _value_ argument for a new Data object
              , nextObj[propertyName]
              // the parent argument passed to parsers
              , useParentFlagForNextObject ? nextObj : data
            ]);
          }
        }
        // prepend the existing queue with these "child" members of the current data object
        queue = queueBuffer.concat(queue);
      }
    }
  }
  return dataset;
})
// .spawn returns a curried call to genData (or a parent generator), passing along a custom configuration or parser functions.
.spawn = function spawn() {
  var
    // function to invoke
    parentGenerator = this
    // functions to curry
    , parsers = [].slice.call(arguments)
      .filter(function (arg) {
        // only retain functions
        return typeof arg === 'function';
      })
  ;
  // the generator to return
  function generator(stuff) {
    // if called with `new`...
    if (this instanceof generator) {
      // do nothing
      return this;
    }
    // (otherwise), invoke the parentGenerator passing all arguments and the prepended curried parser(s)
    return parentGenerator.apply(typeof this === 'function' ? this : generator, [stuff].concat(parsers,[].slice.call(arguments).slice(1)));
  }
  // extend prototype of the parent generator
  generator.prototype = new parentGenerator();
  // append spawn method to the new generator - so it can spawn more generators
  generator.spawn = spawn;
  // return the new generator function
  return generator;
};