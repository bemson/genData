# genData
by Bemi Faison

version 0.1
(6/19/11)

## DESCRIPTION

genData is a generic non-recursive, depth-first, parser that normalizes objects into arrays of sequenced data (or "datasets"). genData lets you modify the structure and prototype of data objects, or capture configurations as _generators_, which are themselves extendable.

Below is the dataset generated from the object: `{foo: 'bar'}`.

```js
// genData({foo: 'bar'});
[
  {
    name: '',
    value: {foo: 'bar'},
    parent: undefined
  },
  {
    name: 'foo',
    value: 'bar',
    parent: << data object reference >>
  }
]
```

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

Spawn custom generators to modify and filter your stuff.
```js
var genFilteredData = new genData(
  function (name, value, parent, index) {
    if (name.charAt(0) === '_') return 0; // exclude from dataset but continue parsing
  },
  function (name, value, parent, index) {
    if (name.indexOf('$') > -1) return false; // exclude from dataset and skip further parsing
  }
);
```


Extend generators to define increasingly complex data models and prototype chains.
```js
// cache the type of each data's value
var genTypes = new genFilteredData(
  function (name, value, parent, index) {
    this.cachedType = typeof value;
  }
);

// init attributes property, and add name/value pair for children prefixed with an underscore
var genAttrData = new genFilteredData(
  function (name, value, parent, index) {
    this.attributes = {};
    if (parent && name.charAt(0) === '_') {
      parent.attributes[name.substr(1)] = value;
    }
  }
);
```


Prototype members to generators, to make them available in spawned generators and their datasets.
```js
// add property to all datasets
genData.prototype.someMember = 'now present in all dataset';
// add method to datasets from this and current/future spawned generators
genAttrData.prototype.hasAttribute = function (key) {
  return this.attributes.hasOwnProperty(key);
};
```


Change the model (i.e., structure and prototype) of existing datasets, by passing them to a different generator.
```js
var strippedAttributes = genData(genAttrData(stuff));
```

---

Full documentation is under development. Please see the source file comments.

## LICENSE

Flow is available under the terms of the [MIT-License](http://en.wikipedia.org/wiki/MIT_License#License_terms).

Copyright 2011, Bemi Faison