describe( 'iteration flag "queued"', function () {

  it( 'should be zero initially', function () {
    var ran = 0;
    genData(1, function (n,v,p, iterationFlags) {
      ran++;
      iterationFlags.queued.should.equal(0);
    });
    ran.should.equal(1);
  });

  it( 'should reflect the number of items awaiting iteration', function () {
    var values = [];

    genData(
      ['a',['b','c', ['d','e','f','g']], 'b'],
      function (n,v,p, iterationFlags) {
        values.push(iterationFlags.queued);
      }
    );
    values.should.deep.equal([0, 2, 1, 3, 2, 1, 4, 3, 2, 1, 0]);
  });

});
