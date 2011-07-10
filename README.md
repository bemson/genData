# genData
A normalization pattern to build, query, and manipulate everything.

(7/9/11)
version 0.7
by Bemi Faison


## DESCRIPTION


genData is a recursive, depth-first iterator and generic parser, for querying objects. genData makes it easy to control iteration and parsing, along with the resulting dataset.


## FILES


* gendata-min.js - genData source file (minified with [UglifyJS](http://marijnhaverbeke.nl/uglifyjs) )
* src/ - Directory containing the source code
* LICENSE - The legal terms and conditions under which this software may be used
* README.md - This readme file


## USAGE


Include `gendata-min.js` in your application.


**Caution** genData _will_ scan objects recursively!! You must define a _parser_ to avoid infinite loops, as there is no built-in error handling.


### Basics


1) Convert stuff to a dataset.


```js

var dataStuff = genData(stuff);

```

A _dataset_ is an array of normalized (i.e., identical) data objects. Below is the datset returned from parsing `{foo: 'bar'}`.


```js

var dataset = genData({foo: 'bar'});
/*
dataset =>
    [
      { // data object #1
       name: '',
       value: {foo: 'bar'}
      },
      { // data object #2 (child of data object #1)
        name: 'foo',
        value: 'bar'
      }
    ]
*/

```

2) Use standard array functions like `.filter()` and `.map()`, to query and manipulate the returned dataset.

```js

var functionsInDataset = dataStuff
  .filter(function (data) {
    return data.value === 'function'
  })
  .map(function (data) {
    return data.value;
  });

```

3) Or, provide _parser_ functions to filter and map stuff for you.

```js

var functionsInStuff = genData(
  stuff,
  function (name, value, parent, dataset, flags) {
    flags.exclude = true;
    if (typeof value === 'function') dataset.push(value);
  }
);


```

### Customizing genData


Modify the structure of each data object generated from stuff.


```js

var metaStuff = genData(
  stuff,
  function (name, value, parent, dataset, flags) {
    var data = this;
    data.uniqueId = (Math.random() * 1000).toString(20);
    data.shortName = name.substr(0,4);
  }
);

```


Exclude parts of stuff from the dataset.


```js

var stringlessStuff = genData(
  stuff,
  function (name, value, parent, dataset, flags) {
    // tell genData to exclude strings
    flags.exclude = value === 'string';
  }
);

```


Create stuff with a familiar prototype.


```js

var myObjs = genData(
  stuff,
  function (name, value, parent, dataset, flags) {
    this.somePrototypedMethod();
  },
  myConstructorsPrototype
);

```


Incrementally structure and filter stuff, using any combination of _parsers_.


```js

var ultraParsedStuff = genData(
  stuff,
  [
    filterKeysWithUnderscores,
    denyKeysWithDollarSymbols,
    addUniqueIdProperty,
    addShortNameProperty
  ]
);

```


### Extending genData


Spawn _generators_ that curry genData calls and extend it's prototype chain.


```js

var genFiltered = new genData(
  function (name, value, parent, dataset, flags) {
    if (name.charAt(0) === '_') {
      flags.exclude = true;
      flags.scanValue = 0;
    }
  },
  function (name, value, parent, dataset, flags) {
    if (name.indexOf('$') > -1) {
      flags.exclude = true;
      flags.scanValue = 0;
      flags.parse = 0;
    }
  }
);

```


Spawn generators from generators, in order to compound parsers and further prototype-chains.


```js

// cache the type of each data's value
var genTypeCaches = new genFiltered(
  function (name, value, parent, dataset, flags) {
    this.cachedType = typeof value; 
  }
);

// init attributes property, and add name/value pair for children prefixed with an underscore
var genAttrData = new genFiltered(
  function (name, value, parent, dataset, flags) {
    this.attributes = {}; // add attributes property to data
    // if this data object has a parent and it's name begins with an underscore...
    if (parent && name.charAt(0) === '_') {
      // tell genData to exclude this data object from the dataset
      flags.exclude = 1;
      // add an attribute to the parent, using this data's name and value
      parent.attributes[name.substr(1)] = value;
    }
  }
);

```


Prototype members to generators (including genData), for incremental functionality.


```js

// data created from genData (and spawned generators) will have this property
genData.prototype.someMember = 'now available to all data objects';
// data created from this generator (and those spawned from it) will have this method
genAttrData.prototype.hasAttribute = function (key) {
  return this.attributes.hasOwnProperty(key);
};

```


---

Full documentation is under development.

## LICENSE

Flow is available under the terms of the [MIT-License](http://en.wikipedia.org/wiki/MIT_License#License_terms).

Copyright 2011, Bemi Faison