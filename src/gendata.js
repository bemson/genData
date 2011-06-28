/*
genData is an object iterator and parser, with prototype-able curry functions

Generator returns a dataset (an array of sequenced data points)
1 - genData([stuff [, parsers [, model]]])
  stuff - Mixed, any object to convert into a dataset
  parsers - Array|Function, one or more parser functions (to modify data structure and control the parse loop)
  model - Object, prototype for generated data

Constructor returns a new generator that is part of the prototype chain and a preset parsers
1 - new genData([parser1, [parserN, ...]])
  parserN - Function, data constructor and dataset filters
2 - new genData(model, parsers)
  model - Object, prototype for generated data
  parsers - Array, collection of parser functions (data constructors and dataset filters)

Parser function signature:
  name - String, the data name
  value - Mixed, the data value
  parent - Object, reference to the parent data (the "_EXCLUDED" property indicates when the parent is not in the dataset)
  datset - Array, the dataset being generated
  flags - Object, collection of loop control flags
    flags.exclude - Bol, (default false), Indicates when this data object should be excluded from the dataset (after parsing completes)
    flags.scanChildren - Bol, (default true) Indicates when the children of this data object should be processed
    flags.parse - Bol, (default true) Indicates when genData should stop parsing this data object
*/
function genData(stuff) {
  // init vars
  var args = arguments, // alias arguments
    flags, // indicators for whether a data object is included in the dataset and parsed
    args, // parser arguments
    origFnc = args.callee, // this genData function
    i, j, d, // loop vars
    parsers = [], // array of parser functions
    dataset = [], // dataset to return
    queue, // queue for creating data
    qItem, // item from queue array
    dataModel = origFnc, // constructor to prototype generated data - set to self by default
    data; // data to assess with parsers (during loop)
  // if not called with `new`...
  if (!(this.hasOwnProperty && this instanceof origFnc)) {
    // if given a second argument, set as parser value - wrap in array when a lone function
    if (args[1]) parsers = typeof args[1] === 'function' ? [args[1]] : args[1];
    // capture parsers length
    j = parsers.length;
    // define base data constructor
    function Data(name, value) {
      this.name = name;
      this.value = value;
    }
    // if second argument is given, assume it's an object model (instance or constructor function)
    if (args[2]) dataModel = args[2];
    // set prototype to dataModel
    Data.prototype = dataModel.prototype;
    // set constructor to dataModel
    Data.prototype.constructor = dataModel;

    // queue stuff
    queue = [['', stuff]]; // initial data point has no name or parent
    // while there is a queue...
    while (queue.length) {
      // remove item from queue
      qItem = queue.pop();
      // reset loop var
      i = 0;
      // initialize data for this queued item - name and value
      data = new Data(qItem[0], qItem[1]);
      // reset flags
      flags = {
        exclude: 0, // include data in dataset, by default
        scanChildren: 1, // scan children, by default
        parse: 1 // allow parsing, by default
      };
      // cache arguments to parse data
      args = [data.name, data.value, qItem[2], dataset, flags];
      // process all parsers until parsing completes or is stopped...
      while (i < j && flags.parse) {
        parsers[i++].apply(data, args);
      }
      // if exluding data...
      if (flags.exclude) {
        // set exclude flag to true (in case included child data references this data object)
        data._EXCLUDED = !0;
      } else { // otherwise, when not exluding this data object...
        // add to dataset
        dataset.push(data);
      }
      // if children may be scanned and this data's (final) value is an object...
      if (flags.scanChildren && typeof data.value === 'object') {
        // with each property...
        for (d in data.value) {
          // if not inherited, add to processing queue
          if (data.value.hasOwnProperty(d)) queue.unshift([d, data.value[d], data]);
        }
      }
    }
    // return final dataset
    return dataset;
  } else if (stuff !== origFnc) { // or, when called with `new` and the first argument is not the origFnc...

    // if second argument is an array...
    if (args[1] instanceof Array) {
      // use first argument as prototype (assume a constructor function)
      dataModel = stuff;
      // re-assign args to second argument (assumes an array of parser-functions)
      args = args[1];
    }
    // add additional functions to existing parsers - skip check to ensure only functions are passed
    parsers = parsers.concat([].slice.call(args));
    // return generator for this data model/parser combination (a curried call to the original genData function)
    function Model(stuff, oParsers, model) {
      // if called without `new` operator...
      if (!(this.hasOwnProperty && this instanceof Model)) {
        // return filtered/generated dataset - allow parser additions and overriding the datamodel
        return origFnc(stuff, parsers.concat(oParsers || []), model && model.protoype ? model : Model);
      } else if (stuff !== origFnc) { // or, when called with new operator and stuff is not the original function...
        // return new Model generator with any added parsers
        return new origFnc(Model, parsers.concat([].slice.call(arguments)));
      }
      // (otherwise) return self for prototyping
      return this;
    }
    // add prototype chain of dataModel constructor
    Model.prototype = new dataModel(origFnc);
    // reset constructor
    Model.prototype.constructor = Model;
    // return new generator
    return Model;
  }
  // return self for prototype-chaining
  return this;
}