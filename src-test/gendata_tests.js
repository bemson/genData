module('Presence');

test("window.genData does not exist", 1, function() {
  ok(window.genData, "genData is not loaded");
});

!function () {
  var script = document.createElement('script');
  script.setAttribute('src', '../gendata-min.js');
  document.getElementsByTagName('head')[0].appendChild(script);
}();

test("window.genData is valid", 2, function() {
  ok(window.genData, "genData is loaded");
  equal(typeof genData, 'function', 'genData is a function');
});

module('Normalizing');

test("nothing", 8, function () {
  var dataset = genData();
  equal(typeof dataset, 'object', 'Returns an object');
  ok(~{}.toString.call(dataset).indexOf('y'), 'Outputs an array');
  equal(dataset.constructor, Array, "The object's constructor is Array");
  equal(dataset.length, 1, 'The dataset has one data object');
  ok(dataset[0].hasOwnProperty('name'), 'The data object has a name member.');
  ok(dataset[0].hasOwnProperty('value'), 'The data object has a value member.');
  strictEqual(dataset[0].name, '', 'The data name is an empty string.');
  strictEqual(dataset[0].value, undefined, 'The data value is undefined.');
});

test("objects", 5, function () {
  var stuff = {
      foo: 'bar'
    },
    dataset = genData(stuff),
    i = 0, datasetCnt = dataset.length;
  equal(datasetCnt, 2, 'The dataset contains the correct number of data objects');
  for (; i < datasetCnt; i++) {
    ok(dataset[i].hasOwnProperty('name'), 'This data object has a name member.');
    ok(dataset[i].hasOwnProperty('value'), 'This data object has a value member.');
  }
});

test('arrays', function () {
  var stuff = ['alpha', 'beta', 'disco', 'theta'],
    dataset = genData(stuff),
    i = 0, datasetCnt = dataset.length;
  equal(datasetCnt, stuff.length + 1, 'Has expected number of data objects.');
  for (; i < datasetCnt; i++) {
    equal(typeof dataset[i].name, 'string', 'The data name is a string.');
    if (i) {
      equal(dataset[i].name, i - 1, 'The data name is numeric.');
      equal(dataset[i].value, stuff[i - 1], 'The data value is correct');
    } else {
      equal(dataset[i].value, stuff,'The data value is correct');
    }
  }
});

test('associative-arrays', 3, function () {
  var stuff = ['alpha', 'beta'],
    assocKeyValue = 'foo',
    dataset,
    i = 0, datasetCnt;
  stuff.assocKey = assocKeyValue;
  dataset = genData(stuff);
  datasetCnt = dataset.length;
  equal(datasetCnt, stuff.length + 2, 'Has expected number of data objects.');
  for (; i < datasetCnt; i++) {
    if (dataset[i].name === 'assocKey') {
      ok(true, 'the associative key was parsed');
      equal(dataset[i].value, assocKeyValue, 'the data object for the key has the correct value')
      break;
    }
  }
});

test('functions', 5, function () {
  var stuff = function () {},
    dataset = genData(stuff);
  equal(dataset.length, 1, 'Has expected number of data objects.');
  ok(dataset[0].hasOwnProperty('name'), 'The data object has a name member.');
  ok(dataset[0].hasOwnProperty('value'), 'The data object has a value member.');
  strictEqual(dataset[0].name, '', 'The data name is an empty string.');
  strictEqual(dataset[0].value, stuff, 'The data value is the function.');
});

test('mixed objects', 6, function () {
  var stuff = {
      foo: 'bar',
      pot: [
        'kettle',
        function () {}
      ]
    },
    dataset = genData(stuff),
    nvTests = [
      ['', stuff],
      ['foo', stuff.foo],
      ['pot', stuff.pot],
      ['0', stuff.pot[0]],
      ['1', stuff.pot[1]]
    ],
    i = 0, nvCnt = nvTests.length,
    x, datasetCnt = dataset.length;
  equal(datasetCnt, nvCnt, 'Has expected number of data objects.');
  for (; i < nvCnt; i++) {
    for (x = 0; x < datasetCnt; x++) {
      if (dataset[x].name === nvTests[i][0]) {
        equal(dataset[x].value, nvTests[i][1], 'The data object has the expected value.');
        break;
      }
    }
  }
});

test('depth-first ordered tree', function () {
  var stuff = {
      foo: {
        bop: 10,
        echo: {
          lucky: 20,
          happy: 30
        },
        code: [
          40,
          50
        ]
      },
      loop: 60
    },
    dfTests = [
      '',
      'foo',
      'bop',
      'echo',
      'lucky',
      'happy',
      'code',
      '0',
      '1',
      'loop'
    ],
    dataset = genData(stuff),
    i = 0, datasetCnt = dataset.lemgth;
  for (; i < datasetCnt; i++) {
    equal(dataset[i].name, dfTests[i], 'data is located at the expected index of the dataset');
  }
});

module('Parsers');

test('one function as second argument', function () {
  genData('anything', function () {
    ok(true, 'parser called');
  });
});

test('an array of functions as second argument', function () {
  genData(
    'anything',
    [
      function () {
        ok(true, 'first parser called');
      },
      function () {
        ok(true, 'second parser called');
      }
    ]
  );
});


test('scope and signature', function () {
  genData('anything', function (name, value, parent, dataset, flags) {
    var args = arguments;
    equal(this.constructor, genData, 'scope is a genData instance');
    equal(args.length, 5, 'has expected number of arguments');
    equal(typeof name, 'string', 'name is a string');
    if (dataset.length) {
      equal(typeof parent, 'object', 'parent is an object');
      equal(parent.constructor, genData, 'parent is a genData instance');
    } else {
      ok(!parent, 'the first data object has no parent');
    }
    equal(dataset.constructor, Array, 'dataset is an array');
    equal(typeof flags, 'object', 'flags is an object');
    ok(flags.hasOwnProperty('omit'), 'omit flag is present');
    ok(!flags.omit, 'omit flag is false by default');
    ok(flags.hasOwnProperty('scan'), 'scan flag is present');
    ok(flags.scan, 'scan flag is true by default');
    ok(flags.hasOwnProperty('exit'), 'exit flag is present');
    ok(!flags.exit, 'exit flag is false by default');
  });
});

test('add property', function () {
  var propName = 'id',
    dataset = genData('anything', function () {
      this[propName] = Math.random();
    }),
    data = dataset[0];
  ok(data.hasOwnProperty(propName), 'added property');
  equal(typeof data[propName], 'number', 'property is a number');
});

test('remove properties', function () {
  var dataset = genData([1,2,3], function () {
    delete this.name;
    delete this.value;
  }),
  i = 0, datasetCnt = dataset.length;
  ok(datasetCnt, 'data objects were returned');
  for (; i < datasetCnt; i++) {
    ok(!dataset[i].hasOwnProperty('name'), 'the name property was removed');
    ok(!dataset[i].hasOwnProperty('value'), 'the value property was removed');
  }
});

test('original value preserved between parser calls', function () {
  var originalValue = 'foo';
  genData(
    originalValue,
    [
      function (name, value) {
        equal(value, this.value, 'data.value matches the value parameter');
        equal(value, originalValue, 'value matches the original value');
        this.value = 'somethingelse';
        notEqual(value, this.value, 'data.value has been changed');
      },
      function (name, value) {
        equal(value, originalValue, 'value still matches the original value');
        notEqual(value, this.value, 'data.value no longer matches the original value');
      }
    ]
  );
});

test('flags.omit', function () {
  var dataset = genData([1,2,3], function (name, value, parent, dataset, flags) {
      flags.omit = 1;
      if (parent) {
        ok(parent.hasOwnProperty('_OMIT'), 'omitted data objects are flagged');
        strictEqual(parent._OMIT, true, 'the _OMIT flag is true');
      }
    });
  equal(dataset.length, 0, 'dataset has no data objects');
});

test('flags.scan', function () {
  var stuff = [1,2,3],
    dataset = genData(stuff, function (name, value, parent, dataset, flags) {
      flags.scan = 0;
    });
  equal(dataset[0].value, stuff, 'first data object has an enumerable value')
  equal(dataset.length, 1, 'member properties were not scanned');
});

test('flags.exit', function () {
  var tic = 0;
  genData(1,
    [
      function (name, value, parent, dataset, flags) {
        flags.exit = 1;
      },
      function () {
        tic = 1;
      }
    ]
  );
  ok(!tic, 'second parser was skipped');
});

test('alter the dataset', function () {
  var stuff = 1,
    fauxValues = ['hello', 'world'],
    dataset = genData(stuff,
      function (name, value, parent, dataset, flags) {
        flags.omit = 1;
        dataset.splice(0, dataset.length, 'hello', 'world');
      }
    );
  notEqual(typeof stuff, 'object', 'the parsed value has no enumerable members');
  deepEqual(dataset, fauxValues, 'final dataset has been augmented');
});
