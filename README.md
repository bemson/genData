# genData
by Bemi Faison

version 0.1
(6/19/11)

## DESCRIPTION

genData is a non-recursive, depth-first, parser that converts any object into an array of sequenced data (or dataset). 

Spawn generators to customize the parsing filters and modify data structures

## FILES

* gendata-min.js - genData source file (minified with [UglifyJS](http://marijnhaverbeke.nl/uglifyjs) )
* src/ - Directory containing the source code
* LICENSE - The legal terms and conditions under which this software may be used
* README.md - This readme file

## USAGE

Include `gendata-min.js` in your application.

Convert stuff into a generic dataset.
```js
var dataStuff = genData(stuff);
```

Define custom generators to modify and filter stuff.
```js
genFilteredData = new genData(
  function (name, value, parent, index) {
    if (name.charAt(0) === '_') return 0; // exclude from dataset, but continue parsing data
  },
  function (name, value, parent, index) {
    if (name.indexOf('$') > -1) return false; // exclude from data set and skip further parsers
  }
);
```

Spawn from existing generators for increasingly complex data structures.
```js
genAttrData = new genFilteredData(
  function (name, value, parent, index) {
    this.attributes = {};
    if (parent && name.charAt(0) === '_') {
      parent.attributes[name] = value;
    }
  }
);
```

Prototype methods to generators
```js
filteredData = genData(
  stuff, // the stuff to parse
  [
    function (name, value, parent, index) {
      if (name.charAt(0) === '_') return 0; // exclude from dataset, but continue parsing data
    },
    function (name, value, parent, index) {
      if (name.indexOf('$') > -1) return false; // exclude from data set and skip further parsers
    }
  ]
);
```

## LICENSE

Flow is available under the terms of the [MIT-License](http://en.wikipedia.org/wiki/MIT_License#License_terms).

Copyright 2011, Bemi Faison
