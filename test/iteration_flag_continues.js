describe( 'iteration flag "continues"', function () {

  it( 'should be falsy', function () {
    var spy = sinon.spy();

    genData(1, spy);
    spy.firstCall.args[3].continues.should.not.be.ok;
  });

  it( 'should stop invoking continues, when truthy', function () {
    var
      spyA = sinon.spy(),
      spyB = sinon.spy()
    ;

    genData(1,
      spyA,
      function (n,v,p, iterationFlags) {
        iterationFlags.continues = 1;
      },
      spyB
    );

    spyA.callCount.should.equal(1);
    spyB.callCount.should.equal(0);
  });

});