# genData
A normalization pattern to build, query, and manipulate everything.

(11/21/11)
version 1.2.0
by Bemi Faison


## DESCRIPTION

genData is a recursive, depth-first iterator and generic parser, for querying objects. genData lets you control iteration and parsing behavior, along with the returned dataset.


## FILES

* gendata-min.js - genData source file (minified with [UglifyJS](http://marijnhaverbeke.nl/uglifyjs) )
* LICENSE - The legal terms and conditions under which this software may be used
* README.md - This readme file
* src/ - Directory containing the source code
* src-test/ - Directory containing [Qunit](http://docs.jquery.com/Qunit) test files


## INSTALL

Within web browsers, reference the gendata-min.js, as you would any external JavaScript file.

```html
  <script type="text/javascript" src="somepath/gendata-min.js"></script>
  <script type="text/javascript">
    // Your code that uses genData...
  </script>
```

For Node, install genData source files manually, or via npm (recommended).

```bash
  npm install genData
```

Then, for commonJS environments (like Node), require the genData module, and reference the exported genData function.

```js
  var genData = require('genData').genData;

  // Your code that uses genData...
```

## USAGE

**Warning:** genData scans objects _recursively_!! Make sure to check for previously inspected objects, or avoid passing self-referencing structures!

### Normalize

genData translates anything into a _dataset_. A dataset is an array of objects with a common structure. By default, genData assigns a _name_ and _value_ member to dataset objects. The examples below, demonstrate how genData normalizes _data_, the first argument.

Use genData to normalize an object...

```js
  genData({hello: "world"});

  /*
  returns this array...
    [
      {
       name: '',
       value: {hello: 'world', pie: "sky"}
      },
      {
        name: 'hello',
        value: 'world'
      },
      {
        name: 'pie',
        value: 'sky'
      }
    ]
  */
```

Use genData to normalize an array...

```js
  genData([9276, {ping: "pong"}, "foo"]);

  /*
  returns this array...
    [
      {
       name: '',
       value: [9276, {ping: "pong"}, "foo"]
      },
      {
        name: '0',
        value: 9276
      },
      {
        name: '1',
        value: {ping: "pong"}
      },
      {
        name: 'ping',
        value: 'pong'
      },
      {
        name: '2',
        value: 'foo'
      }
    ]
  */
```

Use genData to normalize nothing...

```js
  genData();

  /*
  returns this array...
    [
      {
       name: '',
       value: undefined
      }
    ]
  */
```

### Build

The second argument may be a function or array of functions, called _parsers_.

Use genData with a parser that manipulates members of each data object in the dataset...

```js
  genData(
    [{hello: 'world', pie: "sky"}],
    function () {
      this.randId = Math.random();
      delete this.name;
    }
  );
  /*
  returns this array...
    [
      {
       value: {hello: 'world', pie: "sky"},
       randId: 0.9093414132948965
      },
      {
        value: 'world',
        randId: 0.20426166336983442
      },
      {
        value: 'sky',
        randId: 0.5697704532649368
      }
    ]
  */
```

### Query & Parse

Parsers also control what genData iterates and returns, by performing logic and setting iteration flags from the following function signature.

1. **name** - _String_, The original name of this data object.
2. **value** - _Mixed_, The original value of this data object.
3. **parent** - _Data_, The data object that was scanned in order to create this data object.
4. **dataset** - _Array_, The array that will be returned when genData completes iterating.
5. **flags** - _Object_, A collection of keys used to  for controlling genData.
  * _parent_: The object to be scanned next, in order to create subsequent data objects.
  * _omit_: When truthy, the current data object is excluded from the final dataset.
  * _scan_: When falsy, the current data object will not be scanned by genData.
  * _exit_: When truthy, genData will abort all parsing and iteration queues.
6. **shared** - _Object_, An (initially) empty object that is preserved between parsers invocations, until genData completes all iterations.

Use genData to query the numeric values of an object...

```js
  genData(
    [10, ["echo", {top: 20}], true, 30, "charlie"],
    function (name, value, parent, dataset, flags) {
      flags.omit = typeof value !== 'number';
    }
  );
  /*
  returns this array...
    [
      {
        name: '0',
        value: 10
      },
      {
        name: 'top',
        value: 20
      },
      {
        name: '3',
        value: 50
      }
    ]
  */
```

Use genData to capture all strings of an object...

```js
  genData(
    [10, ["echo", {top: 20}], true, 30, "charlie"],
    function (name, value, parent, dataset, flags) {
      flags.omit = 1;
      if (typeof value === 'string') {
        dataset.push(value);
      }
    }
  );
  /*
  returns this array...
    [
      'echo',
      'charlie'
    ]
  */
```

### Generators

Generators are functions that capture and extend complex parsing logic.

For example, this generator returns all found functions.

```js
  var extractFncs = new genData(
      function (name, value, parent, dataset, flags) {
        flags.omit = 1;
        if (typeof value === 'function') {
          dataset.push(value);
        }
      }
    );
```

You can then pass anything to the @extractFncs@ generator, and it will call genData as if you included the parsers manually.

```js
var foundFncs = extractFns(aBigConfigObject);
```

You can also spawn new generators and pass (additional) parser functions to any generator. Below, we'll spawn a generator from our @extractFncs@ generator, to _further_ exclude functions that have a length greater than 2.

```js
  var extractFncsLessThan3 = new extractFncs(
      function (name, value, parent, dataset) {
        if (typeof value === 'function' && value.length > 2) {
          dataset.pop();
        }
      }
    );
```

### Prototyping

genData, along with each generator, supplies a prototype chain to each data object. Below, we define an @.isArray()@ method to the genData prototype, then access this method through a generator.

```js
  genData.prototype.isArray = function () {
    return !!~{}.toString.call(this.value).indexOf('y');
  };

  var extractArrays = new genData(
      function (name, value, parent, dataset, flags) {
        flags.omit = !this.isArray();
      }
    );
```

You may also pass a third parameter to genData (or a generator), an object or function, to serve as the prototype for the returned data objects.

```js
  var dataset = genData(
      stuff,
      [], // this could also be "falsy"
      {
        myFamiliarMethod: function () {
          // "this" will be the data object
        }
      }
    );

  dataset[0].myFamiliarMethod();
```

**Note:** Generators only branch/extend the genData prototype chain.


## LICENSE

genData is available under the terms of the [MIT-License](http://en.wikipedia.org/wiki/MIT_License#License_terms).

Copyright 2011, Bemi Faison