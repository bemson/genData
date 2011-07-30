# genData
A normalization pattern to build, query, and manipulate everything.

(7/30/11)
version 0.9
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


**Caution** genData _will_ scan objects recursively!!


### Normalize

genData translates anything into a normalized _dataset_ (i.e., an array of identical objects). Below demonstrates how to normalize an object and nothing.

```js
    // normalize an object-literal
    var dataset = genData({hello: 'world'});

    // normalize nothing
    var nada = genData();
```

Below illustrates the resulting datasets, returned by genData.

```
    dataset =>
      [
        {
         name: '',
         value: {hello: 'world'}
        },
        {
          name: 'hello',
          value: 'world'
        }
      ]

    nada =>
      [
        {
         name: '',
         value: undefined
        }
      ]
```

Each data object has the base members name and value, which reference those of it's corresponding (non-inherited) property.

### Parsers

The second argument may be a function or array of functions, called _parsers_. Parsers control how genData iterates over an object's properties, the members for each data object, and which data will be excluded from the final dataset.

This call to genData, passes a parser function which appends the member "random" to each data object.

```js
    var dataIds = genData(
        anyObject,
        function () {
          this.random = Math.random();
        }
      );
```

This call does the same, but passes a collection of parses; the second one rounds the newly added member.

```js
    var dataIds = genData(
        anyObject,
        [
          function () {
            this.random = Math.random();
          },
          function () {
            this.random = Math.round(this.random);
          }
        ]
      );
```

Parser functions have the following signature:

 - name - _String_, The original name of this data object.
 - value - _Mixed_, The original value for this data object.
 - parent - _Data_, The data object, whose value contains this data object's corresponding property.
 - dataset - _Array_, The array returned when genData has completed normalizing an object.
 - flags - _Object_, Collection of keys for controlling genData.
   - omit: When truthy, the current data object is excluded from the final dataset.
   - scan: When falsy, properties of the current data object will not be processed.
   - exit: When truthy, genData stops all parsing and iteration.

This genData call uses a parser to ensure the dataset only contains data objects that reference functions.

```js
    var allFncData = genData(
        anyObject,
        function (name, value, parent, dataset, flags) {
          flags.omit = typeof value !== 'function';
        }
      );
```

Combined with access over the dataset array, parsers can be used to return an array containing items other than data objects. This example is similar to the one above, except the dataset is now a collection of actual functions.

```js
    var allFncs = genData(
        anyObject,
        function (name, value, parent, dataset, flags) {
          flags.omit = 1; // don't let anything in the dataset
          if (typeof value === 'function') {
            dataset.push(value);
          }
        }
      );
```


### Generators

Custom calls to genData can be captured in a closured function, called a _generator_. Generators normalize objects like genData, but send pre-defined arguments, in order to reduce and reuse useful parser functions.

Spawn a generator, by invoking genData with the `new` operator and passing one or more parsers (however, not an array of parsers). 

```js
    var genRandom = new genData(
        function (name, value, parent, dataset, flags) {
          this.random = Math.random();
        }
      );
```

Generators may then be passed an object to normalize, and genData will behave as if the parser were manually added. Below demonstrates two identical calls to genData, one via the previously defined generator function `genRandom()`.

```js
    var predefinedCall = genRandom(anything);

    var manualCall = genData(
        anything,
        function (name, value, parent, dataset, flags) {
          this.random = Math.random();
        }
      );
```

Additionally, generators can spawn generators, in which each then builds upon the customizations of the former.

```js
    var genLuckyPicks = new genRandom(
        function (name, value, parent, dataset, flags) {
          var lucky = Math.round(this.random);
          if (!lucky) {
        
          }
        }
      );
```

### Prototyping

The data objects created by genData, when normalizing an object, use `genData()` as their initial prototype. The following assigns an `.isArray()` method to all data objects created by genData, or via spawned generators.

```js
    genData.prototype.isArray = function () {
      return !!~{}.toString.call(this.value).indexOf('y');
    };
```

Prototyped members are immediately accessible in data objects created by that generator or those spawned from it. Below demonstrates using a prototyped method after normalizing an object, and then within a parser function - before the data is included in the dataset.

```js
    var isThisAnArray = genData(something)[0].isArray();

    var isArraySet = genData(
        something,
        function () {
          this.cachedArrayCheck = this.isArray();
        }
      );
```

When normalizing an object, genData also accepts a function as it's third parameter. This argument becomes the prototype for all data object(s) created during that call.

```js
    var familarData = genData(
        anything,
        [], // this may also be falsy
        aFamiliarConstructor
      );

    familiarData[0].someFamiliarMethod();
```

Spawning generators is a means for extending the prototype chain. Unless a third parameter (the custom constructor) is passed, the data objects receive the generators prototype chain.

Below demonstrates how spawned generators extend the prototype chain.

```js
    var genSpecies = new genData(
        function () {
          this.genus = '';
        }
      ),
      genHuman = new genSpecies(
        function () {
          this.genus = 'homosapien';
          this.mood = 'happy';
        }
      ),
      genWorker = new genHuman(
        function () {
          this.mood = 'crabby';
        }
      );

    // generators spawned from genSpecies receive this method
    genSpecies.prototype.isEvolved = function () {
      return this.genus !== '';
    };

    // data objects from both genHuman and genWorker receive this method
    genHuman.prototype.greeting = function () {
      return 'Hello, I am ' + this.mood;
    };
```

---

Full documentation is under development.

## LICENSE

Flow is available under the terms of the [MIT-License](http://en.wikipedia.org/wiki/MIT_License#License_terms).

Copyright 2011, Bemi Faison