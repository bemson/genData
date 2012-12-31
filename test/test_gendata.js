module('Basics');

test('Namespace', 4, function () {
  equal(typeof genData, 'function', 'genData is a function.');
  equal(typeof genData.spawn, 'function', 'genData.spawn is a method.');
  equal(genData.length, 1, 'genData expects one or more parameters.');
  equal(genData.spawn.length, 0, 'genData.spawn() expects zero parameters.');
});

test('Dataset', 3, function () {
  var stuff = [1,'pipe',['echo',9]],
    dataset = genData(stuff);
  ok(dataset instanceof Array, "The dataset returned by genData is an array.");
  ok(dataset.every(function (data) {return data.hasOwnProperty('name') && typeof data.name === 'string';}), 'Each data object has the string member "name".');
  ok(dataset.every(function (data) {return data.hasOwnProperty('value');}), 'Each data object has the member "value".');
});

test('Parser', 10, function () {
  var
    stuff = 'anything',
    val1 = 0,
    val2 = val1 + 1,
    data,
    datasetParam,
    dataset = genData(
      stuff,
      function (name, value, parent, dataset, flags, shared) {
        data = this;
        equal(typeof this, 'object', 'The parser function scope is a data object.');
        ok(this instanceof genData, 'The data object is a genData instance.');
        equal(arguments.length, 6, 'The parser signature is six arguments.');
        equal(typeof name, 'string', 'The first parameter, "name", is a string.');
        ok(dataset instanceof Array, 'The fourth parameter, "dataset", is an array.');
        equal(typeof flags, 'object', 'The fifth parameter, "flags", is an object.');
        equal(typeof shared, 'object', 'The six parameter, "shared", is an object.');
        val1++;
        datasetParam = dataset;
      },
      function () {
        equal(val1, val2, 'genData executes parsers in the order they are passed.');
        ok(this === data, 'Parsers operate on the same data object.');
      }
    );
  ok(datasetParam === dataset, 'The "dataset" parameter, given to parsers, is the array returned by genData.');
});

test('Generator', 6, function () {
  var
    stuff = 'anything',
    trail = [],
    p1 = function () {trail.push(1);},
    p2 = function () {trail.push(0);},
    genA = genData.spawn(p1, p2),
    genB = genA.spawn();
  equal(typeof genA, 'function', 'genData.spawn() returns a generator.');
  equal(typeof genB, 'function', 'The .spawn() method of a generator, returns a new generator.');
  genA(stuff);
  genData(stuff, p1, p2);
  deepEqual(trail, [1,0,1,0], 'Generators curry parser configurations.');
  genB(stuff);
  deepEqual(trail, [1,0,1,0,1,0], 'Generators spawned from generators, preserve curried parser configurations.');
  ok(
    genData.prototype.isPrototypeOf(genA.prototype) &&
    genData.prototype.isPrototypeOf(genB.prototype) &&
    genA.prototype.isPrototypeOf(genB.prototype) &&
    !genB.prototype.isPrototypeOf(genA.prototype),
    'Generators extend the prototype-chain of the generator that spawned them.'
  );
  ok((genB())[0] instanceof genB, 'Data objects share the prototype of their generator.');
});

module('Normalize');

test('defaults', 2, function () {
  var
    stuff = [[0],'foo'],
    dataset = genData(stuff);
  strictEqual(dataset[0].name, '', 'The "name" member of the first data object is an empty string.');
  ok(dataset[0].value === stuff, 'The "value" member of the first data object is the argument passed to genData.');
});

test("nothing", 5, function () {
  var emptySet = genData(),
    nullSet = genData(null),
    undefinedSet = genData(undefined);
  equal(emptySet.length, 1, 'genData returns a dataset with one item, when called with no arguments.');
  equal(nullSet.length, 1, 'genData returns a dataset with one item, when passed "null".');
  equal(undefinedSet.length, 1, 'genData returns a dataset with one item, when passed "undefined".');
  equal(JSON.stringify(emptySet), JSON.stringify(undefinedSet), 'Passing "undefined" returns the same dataset resulting from no arguments.');
  notEqual(JSON.stringify(emptySet), JSON.stringify(nullSet), 'Passing "null" returns a different dataset than that from no arguments.');
});

test('scalar values', 3, function () {
  var
    string = 'hello world!',
    number = Math.random(),
    boolean = true,
    stringSet = genData(string),
    numberSet = genData(number),
    booleanSet = genData(boolean);
  equal(stringSet.length, 1, 'The dataset from a string has one item.');
  equal(numberSet.length, 1, 'The dataset from a number has one item.');
  equal(booleanSet.length, 1, 'The dataset from a boolean has one item.');
});

test('scalar objects', 3, function () {
  var
    string = new String('hello world'),
    number = new Number(Math.random()),
    boolean = new Boolean(true),
    stringSet = genData(string),
    numberSet = genData(number),
    booleanSet = genData(boolean);
  equal(stringSet.length, string.length + 1, 'The dataset from a string object has one data object (for the initial value), plus an item for each character.');
  equal(numberSet.length, 1, 'The dataset from a number object has one item.');
  equal(booleanSet.length, 1, 'The dataset from a boolean object has one item.');
});

test("objects", 2, function () {
  var
    firstChildName = 'hello',
    firstChildValue = Math.random(),
    secondChildName = 'world',
    secondChildValue = Math.random(),
    stuff = {
      foo: 'bar',
      baz: {
        foo: 'bar',
        baz: {
          foo: 'bar'
        }
      }
    },
    dataset = genData(stuff);
  equal(
    dataset.length,
    JSON.stringify(stuff).match(/\":/g).length + 1,
    'The dataset for an object has an entry for each descendent members plus the initial object.'
  );
  stuff = {};
  stuff[firstChildName] = firstChildValue;
  stuff[secondChildName] = secondChildValue;
  dataset = genData(stuff);
  ok(dataset[1].name === firstChildName && dataset[2].name === secondChildName, 'Child members are indexed in the order they are added to an object.');
});

test('arrays', 2, function () {
  var stuff = ['alpha', 'beta', 'theta'],
    dataset = genData(stuff),
    nbrNames = 0,
    i = 0, datasetCnt = dataset.length;
  equal(
    dataset.length,
    stuff.length + 1,
    'The dataset for an array has an entry for each descendent members plus the initial array.'
  );
  equal(dataset[1].name, parseInt(dataset[1].name), 'The "name" member of array data objects is the element index.');
});

test('associative-arrays', 2, function () {
  var stuff = [],
    assocKeyName = 'ping',
    val = Math.random(),
    val2 = val + 1,
    indexKeyName = '0',
    dataset;
  stuff[assocKeyName] = val;
  stuff.push(val2);
  dataset = genData(stuff);
  equal(dataset.length, stuff.length + 2, 'The dataset for an associative-array has an entry for each array element and associate key/value pair.');
  // this test passes on WebKit and fails on Gecko
  // equal(dataset[1].value, val2, 'Non-numeric array members are processed after indexed element.');
  stuff = [];
  stuff[indexKeyName] = val;
  stuff.push(val2);
  dataset = genData(stuff);
  equal(dataset[1].value, val, 'Numeric members are processed like array indexed elements.');
});

module('Parser signature');

test('[0] name', 2, function () {
  var
    stuff = [1],
    val = Math.random(),
    origName,
    dataset = genData(
      stuff,
      function (name, value, parent) {
        if (parent) {
          origName = name;
          equal(this.name, name, 'The "name" argument matches data.name.');
          this.name = val;
        }
      },
      function (name, value, parent) {
        if (parent) {
          equal(origName, name, 'Changing data.name with one parser doesn\'t change the name argument value.');
        }
      }
    );
});

test('[1] value', 2, function () {
  var
    stuff = 'anything',
    val = Math.random(),
    orig,
    dataset = genData(
      stuff,
      function (name, value, parent) {
        orig = value;
        equal(this.value, value, 'The "value" argument matches data.value.');
        this.value = val;
      },
      function (name, value, parent) {
          equal(orig, value, 'Changing data.value with one parser doesn\'t change the name argument value.');
      }
    );
});

test('[2] parent', 5, function () {
  var
    stuff = [1],
    callCnt = 0,
    dataset = genData(
      stuff,
      function (name, value, parent) {
        if (callCnt++) {
          ok(parent, 'The "parent" argument is present after the first call.');
          ok(parent instanceof genData, 'The "parent" argument is a data instance.');
          equal(typeof parent, 'object', 'The "value" member of the "parent" is an object.');
          ok(parent.value.hasOwnProperty(name), 'The "name" argument is a member of the parent.value.');
        } else {
          strictEqual(parent, undefined, 'The "parent" argument is undefined, on the first parser invocation.');
        }
      }
    );
});

test('[3] dataset', 2, function () {
  var
    stuff = 'anything',
    datasetParam,
    dataset = genData(
      stuff,
      function (name, value, parent, dataset) {
        datasetParam = dataset;
        ok(dataset instanceof Array, 'The "dataset" argument is an array.');
      }
    );
    strictEqual(datasetParam, dataset, 'The "dataset" argument is the array returned by genData.');
});

test('[4] flags', 10, function () {
  var
    stuff = [1],
    flagsParam,
    iteration = 0;
  genData(
    stuff,
    function (name, value, parent, dataset, flags) {
      if (iteration++) {
        ok(flagsParam !== flags, 'The "flags" argument is unique per iteration.');
      } else {
        flagsParam = flags;
        equal(typeof flags, 'object', 'The "flags" argument is an object.');
        'omit|0,scan|1,exit|0'.split(',').forEach(function (flagSet) {
          var
            flag = flagSet.split('|')[0],
            defVal = flagSet.split('|')[1];
          ok(flags.hasOwnProperty(flag), 'The parser flag "' + flag + '" exists.');
          equal(defVal, flags[flag], 'The default ' + flag + ' value is "' + defVal + '".');
        });
        ok(flags.hasOwnProperty('parent'), 'The parser flag "parent" exists.');
        strictEqual(flags.parent, null, 'The default parser value is null');
      }
    }
  );
});

test('[5] shared', 3, function () {
  var
    iteration = 0,
    stuff = [1],
    sharedParam;
  genData(
    stuff,
    function (name, value, parent, dataset, flags, shared) {
      if (iteration++) {
        strictEqual(sharedParam, shared, 'The same object is passed, between iterations, as the "shared" argument.');
      } else {
        sharedParam = shared;
        equal(typeof shared, 'object', 'The "shared" argument is an object.');
        equal(
          (function () {
            var
              keyCnt = 0,
              prop;
            for (prop in shared) {
              if (shared.hasOwnProperty(prop)) {
                keyCnt++;
              }
            }
            return keyCnt;
          })(),
          0,
          'The "shared" argument has no keys.'
        );
      }
    }
  );
});

module('Parser flags');

test('parent', 3, function () {
  var
    simple = 'anything',
    complex = [1,2],
    dataSimple = genData(simple),
    dataComplex = genData(complex),
    dataFauxComplex = genData(
      simple,
      function (name, value, parent, dataset, flags) {
        if (!parent) {
          flags.parent = complex;
        }
      }
    );
  ok(
    [1, 0, '', 'foo bar', true, false].every(function (val) {
      return JSON.stringify(dataSimple) === JSON.stringify(genData(simple, function (name, value, parent, dataset, flags) {flags.parent = val}));
    }),
    'Setting the parent flag to scalar (non-object) values has no effect.'
  );
  equal(
    JSON.stringify(dataComplex.slice(1)),
    JSON.stringify(dataFauxComplex.slice(1)),
    'Setting the parent flag to an object, allows it\'s members to be processed.'
  );
  genData(
    simple,
    function (name, value, parent, dataset, flags) {
      if (!parent) {
        flags.parent = {any:'value'};
      } else {
        ok(parent instanceof genData, 'Even when substituted via flags.parent, the parent argument is always an instance of genData.');
      }
    }
  );
});

test('omit', 5, function () {
  var
    stuff = [Math.random()],
    iteration = 0,
    dataOmit,
    dataset = genData(stuff),
    datasetOmit = genData(
      stuff,
      function (name, value, parent, dataset, flags) {
        if (!iteration++) {
          flags.omit = 1;
          dataOmit = this;
          ok(!dataOmit.hasOwnProperty('_OMIT'), 'Within the same iteration, the omit flag does not impact the data object.');
        }
      }
    );
  notEqual(dataset.length, datasetOmit.length, 'Reduces the number of dataset entries.');
  ok(dataOmit.hasOwnProperty('_OMIT') && dataOmit._OMIT === true, 'Omitted data objects have an "_OMIT" member, set to true.');
  equal(dataset[1].value, datasetOmit[0].value, 'Descendent members of omitted data objects are still processed.');
  iteration = 0;
  datasetOmit = genData(
    stuff,
    function (name, value, parent, dataset, flags) {
      if (iteration++) {
        ok(parent.hasOwnProperty('_OMIT'), 'Omitted data objects are still passed as the "parent" argument, when processing child data objects.');
      } else {
        flags.omit = 1;
      }
    }
  );
});

test('scan', 4, function () {
  var
    stuff = [Math.random()],
    iteration = 0,
    dataSkip,
    dataset = genData(stuff),
    datasetSkipped = genData(
      stuff,
      function (name, value, parent, dataset, flags) {
        flags.scan = 0;
        dataSkip = this;
        ok(1, 'Within the same iteration, the scan flag does not impact the data object.');
      }
    );
  notEqual(dataset.length, datasetSkipped.length, 'Reduces the number of dataset entries.');
  equal(datasetSkipped.indexOf(dataSkip), 0, 'Unscanned data is still included in the dataset.');
  equal(dataset.length, datasetSkipped.length + 1, 'Descendent members of unscanned data objects are not processed.');
});

test('exit', 5, function () {
  var
    stuff = [1],
    tick = 0,
    dataExit,
    dataset = genData(stuff),
    datasetExit = genData(
      stuff,
      function (name, value, parent, dataset, flags) {
        flags.exit = 1;
        dataExit = this;
        ok(1, 'Within the same iteration, the exit flag does not impact the data object.');
      },
      function () {
        tick++;
      }
    );
  notEqual(dataset.length, datasetExit.length, 'Reduces the number of dataset entries.');
  ok(!tick, 'Subsequent parser functions are skipped.');
  equal(datasetExit.indexOf(dataExit), 0, 'Exited data is still included in the dataset.');
  equal(dataset.length, datasetExit.length + 1, 'No other members are processed.');
});

module('Generator');

test('scope injection', 5, function () {
  var
    stuff = 'anything',
    tick = 0,
    genSpawn = genData.spawn(),
    genSubSpawn;

  ok(
    [0, 1, [], {}, true, false, /a/].every(function (scope) {
      return genData.call(scope, stuff)[0] instanceof genData && genSpawn.call(scope, stuff)[0] instanceof genSpawn;
    }),
    'Invoking genData/generators with a non-function scope has no effect.'
  );
  ok(genData.call(substituteScope, stuff)[0] instanceof substituteScope, 'Invoking genData with a function scope, makes the data instances of the injected scope.');
  ok(genSpawn.call(substituteScope, stuff)[0] instanceof substituteScope, 'Invoking generators with a function scope, makes the data instances of the injected scope.');

  genData.spawn.call(substituteSpawnScope);
  genSubSpawn = genSpawn.spawn.call(substituteGeneratorSpawnScope);

  equal(tick, 2, 'Substituting the scope of .spawn() with a function, invokes that function with the `new` statement.');
  equal(genSubSpawn(stuff), undefined, 'Invoking a generator spawned with a substitute function scope, invokes that function instead of genData, and does not return a dataset.');

  function substituteSpawnScope() { 
    if (this instanceof substituteSpawnScope) {
      tick++;
    }
  }
  function substituteGeneratorSpawnScope() {
    if (this instanceof substituteGeneratorSpawnScope) {
      tick++;
    }
  }
  function substituteScope() {}
});

module('Loading');

test('AMD', 5, function () {
  var script = document.createElement('script');

  script.onload = function () {
    var
      genDataMinified,
      genDataAMD,
      tick = 0,
      rjs = requirejs.config({
        baseUrl: '..',
        paths: {
          genData: 'gendata-min'
        }
      })
    ;

    function finalize() {
      if (tick++) {
        ok(genDataMinified !== genDataAMD, 'The AMD loaded minified and source versions are unique.');
        start();
      }
    }

    rjs(['src/gendata'], function (rjsGD) {
      genDataAMD = rjsGD;
      ok(typeof rjsGD == 'function', 'The source file loads via AMD.');
      ok(rjsGD !== genData && typeof rjsGD.spawn === 'function', 'The source AMD version is distinct from the window instance.');
      finalize();
    });

    rjs(['genData'], function (rjsGD) {
      genDataMinified = rjsGD;
      ok(typeof rjsGD == 'function', 'The minified version loads via AMD, using the "genData" dependency alias.');
      ok(rjsGD !== genData && typeof rjsGD.spawn === 'function', 'The AMD minified version is distinct from the window instance.');
      finalize();
    });
  };
  script.setAttribute('src', 'requirejs/require.js');
  document.body.appendChild(script);
  stop();
});
