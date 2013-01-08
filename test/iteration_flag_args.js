describe( 'iteration flag "args"', function () {

  it( 'should be an array', function () {
    var spy = sinon.spy();
    genData(1, spy);
    spy.firstCall.args[3].args.should.be.an.instanceOf(Array);
  });

  it( 'should be an array of non-functions, passed to genData after the initial value', function () {
    var
      spyA = sinon.spy(),
      spyB = sinon.spy(),
      arg1 = {},
      arg2 = 'foo'
    ;
    genData(1, arg2, spyA, arg1, spyB);
    spyA.firstCall.args[3].args
      .should.have.lengthOf(2)
      .and.satisfy(function (argsArray) {
        return argsArray[0] === arg2 && argsArray[1] === arg1;
      }, 'args array values have the correct order' );
  });

});