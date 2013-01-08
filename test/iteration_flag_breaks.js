describe( 'iteration flag "breaks"', function () {

  it( 'should be falsy', function () {
    var spy = sinon.spy();

    genData(1, spy);
    spy.firstCall.args[3].breaks.should.not.be.ok;
  });

  it ( 'should stop further iterations when truthy', function () {
    var
      stuff = [1],
      normalResultLength = genData(stuff, callback).length
    ;

    function callback(n, v) {
      return v;
    }

    genData(
      stuff,
      callback,
      function (n,v,p, iterationFlags) {
        iterationFlags.breaks = 1;
      }
    ).should.have.lengthOf(1)
    .and.length.below(normalResultLength);
  });

});