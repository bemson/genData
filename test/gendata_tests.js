module('Basics');

test('Presence', 2, function () {
  equal(typeof genData, 'function', 'genData is a function.');
  equal(genData.length, 1, 'genData expects one or more parameters.');
});

test('Dataset', 5, function () {
  var dataset = genData();
  ok(dataset instanceof Array, "The dataset returned by genData is an array.");
  ok(dataset[0].hasOwnProperty('name'), 'Each data object has a "name" member.');
  equal(typeof dataset[0].name, 'string', 'The "name" member is a string.');
  ok(dataset[0].hasOwnProperty('value'), 'Each data object has a "value" member.');
  strictEqual(dataset[0].name, '', 'By default, the first data object\'s "name" member is an empty string.');
});

module('Normalize');

test("nothing", 2, function () {
  var dataset = genData(),
    undefSet = genData(undefined);
  equal(dataset.length, 1, 'genData returns a dataset with one item, when passed nothing or "undefined".');
  deepEqual(dataset, undefSet, 'Passing nothing or undefined, results in the same dataset.');
});

test("objects", 3, function () {
  var bar = {},
    stuff = {
      foo: bar,
      ping: 'pong'
    },
    dataset = genData(stuff);
  equal(dataset.length, (function () {
    var cnt = 0, i;
    for (i in stuff) {
      if (stuff.hasOwnProperty(i)) {
        cnt++;
      }
    }
    return cnt;
  })() + 1, 'The normalized object has the expected number of data objects.');
  strictEqual(dataset[0].value, stuff, 'The value of the first data object references the first argument passed to genData.');
  ok(!!function () {
    var i = 0, cnt = 0,
      ds = [{name:'',value:stuff}, {name:'foo',value:bar}, {name:'ping',value:'pong'}];
    for (; i < dataset.length; i++) {
      if (dataset[i].name === ds[i].name && dataset[i].value === ds[i].value) {
        cnt++;
      }
    }
    return cnt === dataset.length;
  }, 'genData normalized the object into the expected dataset format.');
});

test('arrays', function () {
  var stuff = ['alpha', 'beta', 'disco', 'theta'],
    dataset = genData(stuff),
    nbrNames = 0,
    i = 0, datasetCnt = dataset.length;
  equal(datasetCnt, stuff.length + 1, 'The normalized array has the expected number of data objects.');
  for (; i < datasetCnt; i++) {
    if (dataset[i].name == i - 1) {
      nbrNames++;
    }
  }
  equal(nbrNames, stuff.length, 'The array element\'s index becomes the "name" member.');
  ok(!!function () {
    var i = 0, cnt = 0,
      ds = [{name: '', value: stuff}, {name:'0', value:'alpha'}, {name:'1',value:'beta'}, {name:'2',value:'disco'}, {name:'3',value:'theta'}];
    for (; i < dataset.length; i++) {
      if (dataset[i].name === ds[i].name && dataset[i].value === ds[i].value) {
        cnt++;
      }
    }
    return cnt === dataset.length;
  }, 'genData normalized the array into the expected dataset format.');
});

test('associative-arrays', 3, function () {
  var stuff = [],
    assocKeyValue = 'pong',
    assocKeyName = 'ping',
    dataset,
    i = 0, datasetCnt;
  stuff[assocKeyName] = assocKeyValue;
  dataset = genData(stuff);
  datasetCnt = dataset.length;
  equal(datasetCnt, stuff.length + 2, 'The normalized associative-array has the expected number of data objects.');
  for (; i < datasetCnt; i++) {
    if (dataset[i].name === assocKeyName) {
      equal(dataset[i].value, assocKeyValue, 'genData creates data objects for non-indexed members of an associative array.');
      break;
    }
  }
  ok(!!function () {
    var i = 0, cnt = 0,
      ds = [{name: '', value: stuff}, {name:assocKeyName, value:assocKeyValue}];
    for (; i < dataset.length; i++) {
      if (dataset[i].name === ds[i].name && dataset[i].value === ds[i].value) {
        cnt++;
      }
    }
    return cnt === dataset.length;
  }, 'genData normalized the associative-array into the expected dataset format.');
});

test('functions', 2, function () {
  var stuff = function () {},
    dataset = genData(stuff);
  equal(dataset.length, 1, 'The normalized function has the expected number of data objects.');
  strictEqual(dataset[0].value, stuff, 'The first data object value is the function.');
});

test('mixed object', 2, function () {
  var potAryFnc = function () {},
    potAry = [
      'kettle',
      potAryFnc
    ],
    stuff = {
      foo: 'bar',
      pot: potAry
    },
    dataset = genData(stuff);
  equal(dataset.length, 5, 'The normalized mixed-object has the expected number of data objects.');
  ok(!!function () {
    var i = 0, cnt = 0,
      ds = [{name: '', value: stuff}, {name:'foo', value:'bar'}, {name:'pot', value:potAry}, {name:'0', value:'kettle'}, {name:'1', value:potAryFnc}];
    for (; i < dataset.length; i++) {
      if (dataset[i].name === ds[i].name && dataset[i].value === ds[i].value) {
        cnt++;
      }
    }
    return cnt === dataset.length;
  }, 'genData normalized the mixed-object into the expected dataset format.');
});

test('depth-first ordered tree', 1, function () {
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
    dsOrder = [
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
    dsOrderTest = 0,
    dataset = genData(stuff),
    i = 0;
  for (; i < dataset.length; i++) {
    if (dataset[i].name === dsOrder[i]) {
      dsOrderTest++;
    }
  }
  equal(dsOrder.length, dsOrderTest, 'Each data object occurs in the expected order.');
});

module('Parsers');

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
    equal(typeof flags, 'object', 'flags is an object');
    ok(flags.hasOwnProperty('omit'), 'omit flag is present');
    ok(!flags.omit, 'omit flag is false by default');
    ok(flags.hasOwnProperty('scan'), 'scan flag is present');
    ok(flags.scan, 'scan flag is true by default');
    ok(flags.hasOwnProperty('exit'), 'exit flag is present');
    ok(!flags.exit, 'exit flag is false by default');
  });
});

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

test('spawning', 7, function () {
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
});

test('signature', 5, function () {
  var val = 8,
    fnc = function () {
      this.id = val;
    },
    genX = new genData(fnc),
    model = function () {},
    genXY = new genX(fnc),
    genXYZ = new genX(fnc, fnc);
  equal('function', typeof genXY, 'can spawn generator passing one parser');
  equal('function', typeof genXYZ, 'can spawn generator passing more parsers');
  equal(val, genX(1, fnc)[0].id, 'accepts a single parser');
  equal(val, genX(1, [fnc, fnc])[0].id, 'accepts an array of parsers');
  ok(genX(1, [], model)[0] instanceof model, 'accepts a base model');
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
  ok(fruit instanceof genFruit, 'fruit comes from fruit generator');
  ok(fruit instanceof genData, 'fruit comes from genData');
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
