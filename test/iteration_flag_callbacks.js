describe( 'iteration flag "callbacks"', function () {

  it( 'should be truthy', function () {
    var spy = sinon.spy();

    genData(1, spy);
    spy.firstCall.args[3].callbacks.should.be.ok;
  });

  it( 'should stop invoking callbacks, when falsy', function () {
    var
      spyA = sinon.spy(),
      spyB = sinon.spy()
    ;

    genData(1,
      spyA,
      function (n,v,p, iterationFlags) {
        iterationFlags.callbacks = 0;
      },
      spyB
    );

    spyA.callCount.should.equal(1);
    spyB.callCount.should.equal(0);
  });

});