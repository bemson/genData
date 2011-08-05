module('Normalize');

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

test('depth-first ordered tree', 10, function () {
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
    i = 0;
  for (; i < 10; i++) {
    equal(dataset[i].name, dfTests[i], 'data is located at the expected index of the dataset');
  }
});

module('Parser');

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
    equal(args.length, 6, 'has expected number of arguments');
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

test('preserving original value between parsers', function () {
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

test('preserving shared object between parsers and iterations', 5, function () {
  var sharedSet = 0,
    sharedRef,
    parser = function (name, value, parent, dataset, flags, shared) {
      if (!sharedSet) {
        sharedSet = 1;
        ok(typeof shared === 'object', 'shared argument is an object');
        shared.idx = 0;
        sharedRef = shared;
      } else {
        shared.idx++;
        ok(shared === sharedRef, 'shared object is the same');
      }
    };
  genData(
    [1],
    [
      parser,
      parser
    ]
  );
  equal(sharedRef.idx, 3, 'parsers see same shared object between iterations');
});

test('flags.parent', function () {
  var passParentFnc = function (name, value, parent, dataset, flags) {
      this.parent = parent;
      flags.parent = parent;
    },
    sampleData = [[1]],
    simpleSet = genData(sampleData, passParentFnc),
    genChain = new genData(passParentFnc),
    chainSet = genChain(sampleData),
    model = function () {},
    modelSet = genData(sampleData, passParentFnc, model),
    failSetFalsy = genData(sampleData, function (name, value, parent, dataset, flags) {
      this.parent = parent;
      flags.parent = 0;
    }),
    failSetTruthy = genData(sampleData, function (name, value, parent, dataset, flags) {
      this.parent = parent;
      flags.parent = 1;
    }),
    failSetObject = genData(sampleData, function (name, value, parent, dataset, flags) {
      this.parent = parent;
      flags.parent = {};
    });

  equal(simpleSet[1].parent, simpleSet.pop().parent, 'parent change works');
  equal(chainSet[1].parent, chainSet.pop().parent, 'parent may be instanceof genData');
  equal(modelSet[1].parent, modelSet.pop().parent, 'parent may be the substituted model');
  notEqual(failSetFalsy[1].parent, failSetFalsy.pop().parent, 'flags.parent can not be falsy');
  notEqual(failSetTruthy[1].parent, failSetTruthy.pop().parent, 'flags.parent can not be truthy');
  notEqual(failSetObject[1].parent, failSetObject.pop().parent, 'flags.parent can not be any object');
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
  ),
  stuff = [1,2,3],
  dataset = genData(stuff),
  exitSet = genData(stuff, function (name, value, parent, dataset, flags) {
    flags.exit = 1;
  });
  ok(!tic, 'second parser was skipped');
  equal(1, exitSet.length, 'only one data object was created');
  notEqual(dataset.length, exitSet, 'exit flag reduced the number of data objects created');
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


module('Generator');

test('spawning', 8, function () {
  var tic = 0,
    parser = function () {
      ok(1, 'parser passed from generator to genData');
    },
    gen = new genData(parser),
    tmp = genData,
    dataset;
  ok(typeof gen === 'function', 'returns a function');
  genData = function () {
    tic = 1;
  };
  dataset = gen(1); // should fire assertion in parser()
  equal(tic, 0 , 'generator is a closured call');
  genData = tmp;
  gen(1, parser);
  gen(1, [parser]);
  ok(dataset[0].constructor === gen, 'data object constructor is generator');
});

test('signature', function () {
  
});

test('compounding', function () {
  var strStart = 'foo',
    strEnd = strStart.toUpperCase(),
    idF = function () {
      this.id = strStart;
    },
    upperF = function () {
      this.id = this.id.toUpperCase();
    },
    genId = new genData(idF),
    genUpper = new genId(upperF),
    dataCompound = genUpper(1)[0],
    dataManual = genData(
      1,
      [
        idF,
        upperF
      ]
    )[0];
  equal(strEnd, dataCompound.id, 'the second generator added to the the first');
  equal(strEnd, dataManual.id, 'manual result matches compound generator');
});

module('Prototype');

test('chaining', function () {
  var emptyFnc = function () {},
    genAnimal = new genData(emptyFnc),
    genDog = new genAnimal(emptyFnc),
    genFruit = new genData(emptyFnc),
    dog = genDog(1)[0],
    fruit = genFruit(1)[0];
  ok(dog instanceof genAnimal, 'dog comes from animal generator');
  ok(dog instanceof genDog, 'dog comes from dog generator');
  ok(dog instanceof genData, 'dog comes from genData');
  ok(dog.constructor === genDog, 'dog is a genDog instance');
  ok(fruit instanceof genFruit, 'fruit comes from fruit generator');
  ok(fruit instanceof genData, 'fruit comes from genData');
  ok(fruit.constructor === genFruit, 'fruit is a genFruit instance');
});

test('methods', function () {
  var stuff = {foo:'bar'},
    gen = new genData(function () {}),
    dataset = gen(stuff);
  ok(typeof dataset[0].getValue === 'undefined', 'no getValue method present');
  genData.prototype.getValue = function () {
    ok(this instanceof genData, 'scope is a genData instance');
    return this.value;
  };
  ok(typeof dataset[0].getValue === 'function', 'getValue method exists now');
  ok(typeof dataset[0].toUpperCase === 'undefined', 'no spawned method present');
  gen.prototype.toUpperCase = function () {
    ok(this instanceof gen, 'scope is a gen instance');
    return this.getValue().toUpperCase();
  };
  ok(typeof dataset[0].toUpperCase === 'function', 'spawned method exists now');
  strictEqual(stuff, dataset[0].getValue(), 'genData prototyped method works');
  strictEqual(stuff.foo.toUpperCase(), dataset[1].toUpperCase(), 'generator prototyped method sees chained methods');
  // clean up!
  delete genData.prototype.getValue;
  ok(typeof dataset[0].getValue === 'undefined', 'removed prototyped method from genData');
});

test('substitute base models', function () {
  var tic = 0,
    emptyFnc = function () {},
    parser = function () {
      tic++;
    },
    myModel = function () {},
    dataModel = genData(1, [parser], myModel),
    gen = new genData(parser),
    dataGen = gen(1,[parser], myModel),
    finalTic = 3;
  myModel.prototype.getValue = function () {
    ok(this instanceof myModel, 'scope is an instance of the substitute constructor');
    return this.value;
  };
  gen.prototype.hidden = emptyFnc;
  ok(dataModel[0] instanceof myModel, 'can use prototype of a given constructor');
  ok(!(dataModel[0] instanceof genData), 'substitution kills link to genData');
  ok(dataGen[0] instanceof myModel, 'generators support prototype substitution');
  ok(!(dataGen[0] instanceof genData), 'generator substitutions also kill link to genData');
  ok(typeof dataModel[0].getValue === 'function', 'substitute prototype methods are accessible');
  ok(typeof dataGen[0].hidden === 'undefined', 'generator and genData methods not available with custom prototypes');
  equal(1, dataModel[0].getValue(), 'substitute prototype methods work');
  equal(finalTic, tic, 'Parsers fire during prototype substitution');
});