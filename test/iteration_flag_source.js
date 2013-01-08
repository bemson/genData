describe( 'iteration flag "source"', function () {

  it( 'should be equal to this.value and the second callback argument', function () {
    var
      arg = {},
      spy = sinon.spy()
    ;
    genData(arg,spy);

    spy.firstCall.args[3].source.should.equal(arg);
    spy.firstCall.args[3].source.should.equal(spy.firstCall.thisValue.value);
    spy.firstCall.args[3].source.should.equal(spy.firstCall.args[1]);
  });

  it( 'should determine what values are added to the iteration queue.', function () {
    var
      stuff = 1,
      normalResultLength = genData(stuff, callback).length
    ;

    function callback(n, v) {
      return v;
    }

    genData(
      stuff,
      callback,
      function (n,v,p, iterationFlags) {
        if (iterationFlags.loop === 0) {
          iterationFlags.source = [1];
        }
      }
    ).should.have.lengthOf(2)
      .and.length.above(normalResultLength);
  });

  it( 'should not impact iteration queue, when set to a non-object or one with no members', function () {
    var
      stuff = 1,
      normalResultLength = genData(stuff, callback).length
    ;

    function callback(n, v) {
      return v;
    }

    genData(
      stuff,
      callback,
      function (n,v,p, iterationFlags) {
        iterationFlags.source = 1;
      }
    ).length.should.equal(normalResultLength);

    genData(
      stuff,
      callback,
      function (n,v,p, iterationFlags) {
        iterationFlags.source = {};
      }
    ).length.should.equal(normalResultLength);

  });

});