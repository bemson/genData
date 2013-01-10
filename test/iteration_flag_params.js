describe( 'iteration flag "params"', function () {

  it( 'should be an array', function () {
    var spy = sinon.spy();
    genData(1, spy);
    spy.firstCall.args[3].params.should.be.an.instanceOf(Array);
  });

  it( 'should be an array of all passed parameters', function () {
    var
      spyA = sinon.spy(),
      spyB = sinon.spy(),
      arg1 = {},
      arg2 = 'foo'
    ;
    genData(1, arg2, spyA, arg1, spyB);
    spyA.firstCall.args[3].params
      .should.have.lengthOf(5)
      .and.satisfy(function (paramsArray) {
        return paramsArray[0] === 1 &&
          paramsArray[1] === arg2 &&
          paramsArray[2] === spyA &&
          paramsArray[3] === arg1 &&
          paramsArray[4] === spyB;
      }, 'params array values match the parameter order' );
  });

});