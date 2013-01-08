describe( 'iteration flag "loop"', function () {

  it( 'should be zero initially', function () {
    var ran = 0;
    genData(1, function (n,v,p, iterationFlags) {
      ran++;
      iterationFlags.loop.should.equal(0);
    });
    ran.should.equal(1);
  });

  it( 'should increment with each iteration', function () {
    var values = [];

    genData(
      ['a','b','c'],
      function (n,v,p, iterationFlags) {
        values.push(iterationFlags.loop);
      }
    );
    values.should.deep.equal([0,1,2,3]);
  });

});