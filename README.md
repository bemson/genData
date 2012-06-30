# genData

A normalization pattern to build, query, and manipulate everything.

(6/30/12)
version 2.0.1
by Bemi Faison

## DESCRIPTION

genData enumerates member values and returns a _dataset_, an array of generated content. genData lets you control iteration rules, process members, and alter dataset content with custom functions, called _parsers_. Additionally, parsers may be captured and extended through curry-like functions called _generators_.

## USAGE

By default, genData normalizes the first argument into a depth-first index of generic data objects.

```js
  var
    stuff = {hello:{world:'!'}},
    helloData = genData(stuff);

  console.log(helloData);
  // [
  //   {
  //     name: '',
  //     value: {hello:{world:'!'}}
  //   },
  //   {
  //     name: 'hello',
  //     value: {world:'!'}
  //   },
  //   {
  //     name: 'world',
  //     value: '!'
  //   }
  // ]
```

genData even normalizes nothing...

```js
  console.log(genData());
  // [
  //   {
  //     name: '',
  //     value: undefined
  //   }
  // ]
```

### Data Customization

Data objects represent the initial value and it's descendents, with simple name and value properties. Modify this generic structure via one or more parser functions. Parsers execute in order, scoped to each data object.

```js
  var
    customData = genData(
      stuff,
      function () {
        this.randNum = Math.random();
      },
      function () {
        this.randTen = Math.floor(this.randNum * 10);
      }
    );
  console.log(customData);
  // [
  //   {
  //     name: '',
  //     value: {hello:{world:'!'}},
  //     randNum: 0.31177767971530557,
  //     randTen: 3
  //   },
  //   {
  //     name: 'hello',
  //     value: {world:'!'}
  //     randNum: 0.7495412793941796,
  //     randTen: 7
  //   },
  //   {
  //     name: 'world',
  //     value: '!'
  //     randNum: 0.4247265288140625,
  //     randTen: 4
  //   }
  // ]
```

Data objects use genData's prototype, allowing you to propogate members and methods.

```js
  genData.prototype.getType = function () {
    return typeof this.value;
  };

  var
    objData = genData(
      stuff,
      function () {
        this.isObject = this.getType() == 'object';
      }
    );

  console.log(objData);
  // [
  //   {
  //     name: '',
  //     value: {hello:{world:'!'}},
  //     isObject: true
  //   },
  //   {
  //     name: 'hello',
  //     value: {world:'!'}
  //     isObject: true
  //   },
  //   {
  //     name: 'world',
  //     value: '!'
  //     isObject: false
  //   }
  // ]

  console.log(helloData[0].getType());
  // 'object'

  console.log(customData[2].getType());
  // 'string'
```

### Generators

To isolate and/or pair prototyped members with specific data structures, genData supports "spawning". Spawning curries parser configurations and extends the prototype chain of genData or it's spawned generators.

```js
  var
    genObj = genData.spawn(function () {
      this.isObject = this.getType() == 'object';
    });

  // move the .getType() method to genObj's prototype
  genObj.prototype.getType = genData.prototype.getType;
  delete genData.prototype.getType;

  console.log('Generators hide parser and prototype configurations!', JSON.stringify(objData) == JSON.stringify(genObj(stuff)));
  // 'Generators hide parser and prototype configurations! true'
```

### Prototype substitution

Lastly, you can substitute an entire prototype, by scoping genData/generators calls to a function.

```js

  function Foo() {}
  Foo.prototype.greet = function () {
    console.log('hello world!');
  };

  genData.call(Foo)[0].greet();
  // 'hello world!'

```

### Parser Signature

Parsers receive a special argument signature, which lets them do more than modify the data object. Below are the ordered arguments sent to each parser function.

  1. **name** - The key string for this value, from the parent object. Since the first data object represents the initial value, it's name argument is an empty string. For array elements, the name reflects it's numeric index.
  2. **value** - The value corresponding the key, from the parent object (except in the case of the initial value's data object).
  3. **parent** - The parent object that contains the name/value pair. For the first data object, this argument will be `null`.
  4. **dataset** - The array returned by genData (or the generator).
  5. **flags** - An object with iteration and execution flags that control genData's behavior.
    - _omit_ When truthy, the current data object will not be added to the dataset. (Default is `false`.)
    - _scan_ When falsy, members of the current data object will be processed by genData. (Default is `true`.)
    - _parent_ When set, genData will scan the given object instead of the current object. (Default is `null`.)
    - _exit_ When truthy, genData will halt all processing and return the dataset. (Default is `false`.)
  6. **shared** - An object that is untouched between parser invocations and discarded when genData completes.

Use of these flags, lets you use genData as a filter (or to create generators that filter).

```js
var
  // capture all arrays
  getAllArrays = genData.spawn(function (name, value, parent, dataset, flags) {
    flags.omit = 1;
    if (value instanceof Array) {
      this.isArray = true;
      dataset.push(value);
    }
  }),
  // only capture arrays that are not within arrays
  getFirstArrays = getAllArrays.spawn(function (name, value, parent, dataset, flags) {
    flags.scan = !this.isArray;
  });
```

### Spawning Psuedo-Klasses

With generators and prototyped methods, parsers can initialize data objects, as if you were defining a class constructor and methods.

```js
var
  menuDom = document.getElementById('someUL'),
  genListItems = genData.spawn(function (name, value, parent, dataset, flags, ) {
    flags.omit = typeof value !== 'string';
    this.text = this.value;
    delete this.name;
    delete this.value;
  });

getListItems.prototype.getElement = function () {
  if (!this.cachedNode) {
    this.cachedNode = document.createElement('li');
    this.cachedNode.appendChild(document.createTextNode(this.text));
  }
  return this.cachedNode.cloneNode(1);
};

// add "menu" items to a UL
genListItems(['menu item 1', 'menu item 2']).forEach(function (LI) {
  menuDom.appendChild(LI.getElement());
});
```

View the [genData wiki](http://github.com/bemson/genData/wiki/), for more ways to use genData and generators.


## FILES

* gendata-min.js - genData source file (minified with [UglifyJS](http://marijnhaverbeke.nl/uglifyjs))
* LICENSE - The legal terms and conditions under which this software may be used
* README.md - This readme file
* src/ - Directory containing the source code
* test/ - Directory containing [Qunit](http://docs.jquery.com/Qunit) test files

## INSTALL

For HTML environments, reference gendata-min.js as you would any external JavaScript file.

```html
  <script type="text/javascript" src="somepath/gendata-min.js"></script>
  <script type="text/javascript">
    // Code relying on genData...
  </script>
```

For Node, use npm.

```bash
  npm install genData
```

Then require the genData module and reference the exported `genData` function.

```js
  var genData = require('genData').genData;

  // Code relying on genData...
```

## LICENSE

genData is available under the terms of the [MIT-License](http://en.wikipedia.org/wiki/MIT_License#License_terms).

Copyright 2012, Bemi Faison