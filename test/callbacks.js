describe( 'genData callback', function () {

  var spy;

  before(function () {
    spy = sinon.spy();
    genData([1], spy);
  });

  it( 'should be functions passed to genData, after a first parameter', function () {
    var
      spyA = sinon.spy(),
      spyB = sinon.spy()
    ;
    genData(spyA, spyB);
    spyA.callCount.should.equal(0);
    spyB.callCount.should.equal(1);
  });

  it( 'should be called once per iterable member, plus the given value', function () {
    spy.should.have.been.calledTwice;
  });

  it( 'should be scoped to a unique genData instance', function () {
    spy.firstCall.thisValue.should.be.an.instanceof(genData)
    spy.secondCall.thisValue.should.be.an.instanceof(genData)
    spy.firstCall.thisValue.should.not.equal(spy.secondCall.thisValue);
  });

  it( 'should add returned values to the returned array', function () {
    var
      spy = sinon.spy(function () {return Math.random()}),
      result = genData(sinon, spy);
    ;
    result.should.deep.equal(spy.returnValues);
  });

});
