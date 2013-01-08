describe( 'genData', function () {

  it( 'should be callable', function () {
    genData.should.be.a('function');
  });

  it( 'should instantiate a memberless instance', function () {
    (new genData())
      .should.be.an.instanceOf(genData)
      .and.empty;
  });

  it( 'should return an empty array without arguments', function () {
    genData()
      .should.be.an.instanceOf(Array)
      .and.empty;
  });

  it( 'should return an empty array when not passed callbacks', function () {
    genData(1,[9],{a:'b'})
      .should.be.an.instanceOf(Array)
      .and.empty;
  });

  it( 'should return an empty array when passed non-returning callbacks', function () {
    var spy = sinon.spy(function () {});
    genData('blah', spy)
      .should.be.an.instanceOf(Array)
      .and.empty;
    spy.callCount.should.equal(1);
  });

  it( 'should iterate over an object\'s children before it\'s siblings (depth-first)', function () {
    genData(
      [1,[2,3],[4,[5,6]]],
      function (name, value) {
        if (typeof value === 'number') {
          return value;
        }
      }
    ).should.deep.equal([1,2,3,4,5,6]);
  });

});