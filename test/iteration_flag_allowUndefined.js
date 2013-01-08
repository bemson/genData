describe( 'iteration flag "allowUndefined"', function () {

  it( 'should be falsy', function () {
    var spy = sinon.spy();

    genData(1, spy);
    spy.firstCall.args[3].allowUndefined.should.not.be.ok;
  });

  it ( 'should allow undefined values to be included in the returned array, when truthy', function () {
    var
      stuff = [1, undefined],
      normalResultLength = genData(stuff, callback).length
    ;

    function callback(n, v) {
      return v;
    }

    genData(
      stuff,
      callback,
      function (n,v,p, iterationFlags) {
        iterationFlags.allowUndefined = 1;
        return v;
      }
    ).should.have.lengthOf(3)
    .and.length.above(normalResultLength);
  });

});