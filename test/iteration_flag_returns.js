describe( 'iteration flag "returns"', function () {

  it( 'should be the value returned when calling genData', function () {
    var spy = sinon.spy(function () {return Math.random();});

    genData([1], spy).should.deep.equal(spy.returnValues);
  });

  it( 'should initially be an array', function () {
    var spy = sinon.spy();

    genData(1, spy);
    spy.firstCall.args[3].returns.should.be.an.instanceOf(Array);
  });

  it( 'should be overridable to a different value type', function () {
    genData(1,
      function (n, v, p, iterationFlags) {
        iterationFlags.returns = 20;
      }
    ).should.not.be.an.instanceOf(Array);
  });

  it( 'should return an array when deleted', function () {
    genData(1,
      function (n, v, p, iterationFlags) {
        delete iterationFlags.returns;
      }
    ).should.be.an.instanceOf(Array);
  });

});