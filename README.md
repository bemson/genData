# genData

An iteration utility with a rich callback environment.

[![Build Status](https://travis-ci.org/bemson/genData.png)](https://travis-ci.org/bemson/genData)

(1/10/13)
version 3.1.0
by Bemi Faison

## Usage

genData iterates a _queue_, beginning with the first parameter, then it's non-inherited members, then their non-inherited members, and so on - recursively and in depth-first order. Below is what genData outputs when a callback simply returns the current iteration value.

```js
genData(
  [1,[2,3]],
  function (name, value) {
    return value;
  }
);
// [[1,[2,3]], 1, [2,3], 2, 3]
```

Note how the first element is the original value, passed to genData. Also, note that genData returns an array, which is the default container for each callback's return value (except `undefined`).


### Callbacks

Callbacks are functions passed to genData, after the first parameter. genData executes them in order, and scoped to a uniquely generated "data" objects - representing the name and value of the current iteration. Your callback can use either the first two arguments, or the scope object in it's logic, as follows.

```js
genData(
  [1,2],
  function () {
    if (this.value === 2) {
      return 'world!';
    }
  },
  function (name, value) {
    if (value === 1) {
      return 'hello';
    }
  }
);
// ['hello', 'world!']
```


### Callback Signature

Callbacks receive four arguments per iterated value:

  1. The name (or key) corresponding this value. This is an empty string for the first iteration.
  2. The value being iterated. This is the first parameter passed to genData, for the first iteration.
  3. The data object which sourced the current iteration. This is `undefined`, for the first iteration.
  4. The iteration object, with various flags to use in your logic.


### Iteration Flags


#### flags.allowUndefined

Set this flag to a truthy value, if you want genData to capture the result of callbacks that return `undefined` (which includes callbacks with no `return` statement). This flag is reset to 0 before executing each callback. Below, a callback allows undefined values, which are then captured in the returned array.

```js
genData(
  ['foo', 'bar'],
  function (name, value) {
    return value;
  },
  function (name, value, parent, flags) {
    flags.allowUndefined = 1;
  }
);
// ['foo', undefined, 'bar', undefined]
```


#### flags.args

A simple array of non-function values passed to genData, _after_ the first parameter (the value to iterate). Below, callbacks use arguments to build the array results.

```js
genData(
  ['John', 'Sally'],
  'Hello ',
  function (name, value, parent, flags) {
    if (typeof value === 'string') {
      return flags.args[0] + value + flags.args[1];
    }
  },
  '. How are you?'
);
// ['Hello John. How are you?', 'Hello Sally. How are you?']
```


#### flags.breaks

Similar to the JavaScript `break` statement, genData will abort processing it's queue when this flag is truthy. This flag persists between callbacks, but is reset (to 0) at the beginning of each iteration. Below, a callback tells genData to stop and return the first number found.

```js
genData(
  ['a', 3, 'b', 'c', 'd'],
  function (name, value, parent, flags) {
    if (typeof value === 'number') {
      flags.breaks = 1;
      return value;
    }
  }
);
// [3]
```


#### flags.continues

Similar to the JavaScript `continue` statement, set this flag to a truthy value when you want to end the current iteration and begin the next one. Below, a callback uses this flag to avoid runtime errors.

```js
genData(
  [1.1, 'a', 2.5],
  function (name, value, parent, flags) {
    if (typeof value !== 'number') {
      flags.callbacks = 1;
    }
  },
  function (name, value) {
    return value.toFixed(0);
  }
);
// ['1','3']
```

#### flags.loop

This is a number, reflecting genData's iteration count. The value is 0 initially and increments per iteration.

#### flags.params

A simple array of what was passed to genData. Mutating this array has no impact on genData's iteration or other flags. Below, demonstrates how to use this flag, along with `flag.continues`, in order to custom invoke functions that genData would otherwise assume a callback.

```js
function logger(text) {
  console.log(text);
}

genData(
  ['hello', 'world!'],
  function (name, value, parent, flags) {
    flags.continues = 1;
    if (typeof value === 'string') {
      flags.params[2](value);
    }
  },
  logger
);

// (console output)
// hello
// world!

```

#### flags.queued

This is a number, reflecting genData's queue of pending iterations. Because genData adds to the queue after each iteration, a value of 0 does not mean the end of genData's process.

#### flags.returns

This flag is an array by default, and is what genData returns. This flag persists between callbacks, until genData completes processing a given value. Note that genData will ignore returned callback values, when this flag is not an Array. Below, demonstrates how this flag can change genData's return value.

```js
genData(
  ['e', 'c', 'h', 'o'],
  function (name, value, parent, flags) {
    if (!flags.loop) {
      flags.returns = '';
    }
    if (typeof value === 'string') {
      flags.returns += value;
    }
  }
);
// 'echo'
```

#### flags.source

This value is scanned by genData (at the end of every iteration), in order to add more non-inherited members to genData's queue. By default, this flag reflects the second argument of the callback signature, or the `value` property of the callback scope. Below, this flag is used to make a non-object value iterable.

```js
genData(
  'hello world!',
  function (name, value, parent, flags) {
    if (typeof value === 'string' && value.length > 1) {
      flags.source = value.split('');
      flags.callbacks = false;
    }
  },
  function (name, value) {
    if (typeof value === 'string') {
      return value.toUpperCase();
    }
  }
);
// ['H', 'E', 'L', 'L', 'O', ' ', 'W', 'O', 'R', 'L', 'D', '!']
```


### Spawning genData Generators

The static `.spawn()` method expands upon the concept of currying functions, by also extending genData's prototype chain. Functions _spawned_ by genData are called "generators", which also host the `.spawn()` method for further spawning. Below, two generators are spawned, in order to preserve callback configurations and isolate additions to genData's prototype.

```js
var
  nums = genData.spawn(function (name, value, parent, flags) {
    if (typeof value !== 'number') {
      flags.callbacks = false;
    }
  }),
  calc = nums.spawn(function () {
    return this.square();
  })
;

calc.prototype.square = function () {
  return this.value * this.value;
};

calc(['foo', 2, 'bar', 10]); // [4, 100]
```

Generators accept the same argument signature as genData. Continuing with the example above, the `calc()` generator is refined to prune numbers below 100.

```js
calc(,
  ['foo', 2, 'bar', 10],
  function (name, value, parent, flags) {
    flags.returns = flags.returns.filter(function (value) {
      return value >= 100;
    });
  }
);
// [100]
```

Note: While spawning does allow you to curry values to the iteration flag "args", this practice is not recommended.

## Installation

### Node

Use [npm](http://npmjs.org/) to install the "genData" package, with `npm install genData`. Then, simply require and use the function directly.

```js
var genData = require('genData');

/* genData(stuff, callbacks, arguments, ...) */
```

### AMD

genData anonymously registers itself as an [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) function. Assuming you configured your loader to map the module id "genData" (recommended), then you could include genData in either a module or a top-level script, as follows:

```js
// module
define(function (require, module, exports) {
  var genData = require('genData');

  /* genData(stuff, callbacks, arguments, ...) */  
});

// top-level logic
require(['genData'], function (genData) {
  /* genData(stuff, callbacks, arguments, ...) */  
});
```

### Browser

If you include genData directly in a web page - via the `<script>` tag - it will be available in the global scope. For these kind of static deployments, the minified is recommended.

```html
  <script type="text/javascript" src="somepath/gendata-min.js"></script>
  <script type="text/javascript">
    /* genData(stuff, callbacks, arguments, ...) */
  </script>
```


## Files

  * gendata-min.js - genData source file (minified with [UglifyJS](http://marijnhaverbeke.nl/uglifyjs))
  * LICENSE - The legal terms and conditions under which this software may be used
  * README.md - This readme file
  * src/ - Directory containing the genData source code
  * test/ - Directory containing test files written in the [Mocha](http://visionmedia.github.com/mocha/) framework


## License

genData is available under the terms of the [MIT-License](http://en.wikipedia.org/wiki/MIT_License#License_terms).

Copyright, Bemi Faison