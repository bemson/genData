/**
genData is an object constructor, iterator, parser, and dataset generator.

Generator returns a dataset (an array of sequenced data points)
1 - genData([stuff [, parsers [, protoObj]]])
  stuff - Mixed, any object to convert into a dataset
  parsers - Array|Function, one or more parser functions (to modify data structure and/or exclude data)
  model - Object, prototype for generated data

Constructor returns a new generator with a prototype and parsers that build off the last one.
1 - new genData([parser1, [parserN, ...]])
  parserN - Function, data constructor and dataset filters
2 - new genData(model, parsers)
  model - Object, prototype for generated data
  parsers - Array, collection of parser functions (data constructors and dataset filters)

Parser function signature:
  name - String, the data name
  value - Mixed, the data value
  parent - Object, reference to the parent data
  index - Number, the potential position of the data within the returned array

**/
function genData(stuff) {
  // init vars
  var args = arguments, // alias arguments
    origFnc = args.callee, // this genData function
    i = 0, j, // loop vars
    parsers, // array of data parser functions
    dataset, // dataset to return
    queue, // queue for creating data
    qItem, // item from queue array
    dataModel, // constructor to prototype generated data
    data; // data to assess with parsers (during loop)
  // if not called with `new`...
  if (!(this.hasOwnProperty && this instanceof origFnc)) {
    // use second argument as parsers array or use empty array
    parsers = (typeof args[1] === 'function' ? [args[1]] : args[1]) || [];
    // tests whether data should be included
    function includeData (data) {
      // init vars
      var i = 0, // loop vars
        args = [data.name, data.value, data.parent, dataset.length], // cache arguments for data parsers
        tmp, rslt; // test result swaps
      // process all parsers until one returns false...
      while (i < parsers.length && rslt !== !1) {
        // store parser result temporarily
        tmp = parsers[i++].apply(data, args);
        // if rolling result is truthy or undefined, or temporary result is false,  capture in rolling result
        if (rslt || rslt === undefined || tmp === !1) rslt = tmp;
      }
      // return truthy if the result is truthy or undefined
      return rslt || rslt === undefined;
    }

    // define base data constructor
    function genData (name, value, parent) {
      this.name = name;
      this.value = value;
      this.parent = parent;
    }
    // use the given or default object model, based on whether the third argument is a function
    dataModel = typeof args[2] === 'function' ? args[2] : origFnc;
    // set prototype to dataModel
    genData.prototype = dataModel.prototype;
    // set constructor to dataModel
    genData.prototype.constructor = dataModel;

    // init array of data to return
    dataset = [];

    // if stuff is an array of genData objects...
    if (stuff && typeof stuff.every === 'function' && stuff.every(function (data) {return data instanceof origFnc;})) {
      // query existing dataset...
      stuff.forEach(function (data) {
        // create a new instance from the existing one
        var d = new genData(data.name, data.value, data.parent);
        // if data is successfully modified and included...
        if (includeData(d)) dataset.push(d);
      });
    } else { // otherwise, when defining a new dataset...
      // queue stuff
      queue = [['', stuff]]; // initial data point has no name or parent
      // while there is a queue...
      while (queue.length) {
        // remove item from queue
        qItem = queue.pop();
        // initialize data for this queued item - name, value, parent (object reference)
        data = new genData(qItem[0], qItem[1], qItem[2]);
        // if data is successfully modified and included...
        if (includeData(data)) {
          // add to dataset
          dataset.push(data);
          // if this data's value is an object...
          if (typeof data.value === 'object') {
            // with each property...
            for (j in data.value) {
              // if not inherited, add to processing queue
              if (data.value.hasOwnProperty(j)) queue.unshift([j, data.value[j], data]);
            }
          }
        }
      }
    }
    // return generated/filtered dataset
    return dataset;
  } else if (stuff !== origFnc) { // or, when called with `new` and the first argument is not the origFnc...

    // init parsers collection
    parsers = [];
    // set dataModel to self by default
    dataModel = origFnc;
    // if second argument is an array...
    if (typeof args[1] === 'object' && args[1].forEach) {
      // use first argument as prototype (assume a constructor function)
      dataModel = stuff;
      // re-assign args to second argument (assumes an array of parser-functions)
      args = args[1];
    } else { // otherwise, when second arg is not an array...
      // convert args to an array (assumes all arguments are functions)
      args = [].slice.call(args);
    }
    // with each argument...
    args.forEach(function (fnc) {
      // if a non-genData function, add to parsers
      if (typeof fnc === 'function' && !origFnc.prototype.isPrototypeOf(fnc)) parsers.push(fnc);
    });
    // return generator for this data model/parser combination
    return (function () {
      // define generator
      function genData(stuff, oParsers, model) {
        // if called without `new` operator...
        if (!(this.hasOwnProperty && this instanceof genData)) {
          // return filtered/generated dataset - allow parser additions and overriding the datamodel
          return origFnc(stuff, parsers.concat(oParsers || []), model && model.protoype ? model : genData);
        } else if (stuff !== origFnc) { // or, when called with new operator and stuff is not the original function...
          // return new genData generator with any added parsers
          return new origFnc(genData, parsers.concat([].slice.call(arguments)));
        }
        // (otherwise) return self for prototyping
        return this;
      }
      // add prototype chain of dataModel constructor
      genData.prototype = new dataModel(origFnc); //origFnc.prototype.isPrototypeOf(dataModel) ? new dataModel(origFnc) : new dataModel(); // pass origFnc when dataModel is a genData function (prevents returning anything)
      // reset constructor
      genData.prototype.constructor = genData;
      // return new generator
      return genData;
    })();
  }
  // return self for prototyping
  return this;
}