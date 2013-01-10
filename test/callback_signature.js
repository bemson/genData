describe( 'callback signature', function () {

  var thing, spy;

  before(function () {
    thing = [1];
    spy = sinon.spy();
    genData(thing, spy);
  });


  it( 'should have four arguments', function () {
    spy.firstCall.args.should.have.lengthOf(4);
    spy.secondCall.args.should.have.lengthOf(4);
  });

  describe( 'first argument', function () {

    it( 'should be a string equal to this.name', function () {
      spy.firstCall.args[0].should.equal(spy.firstCall.thisValue.name);
      spy.secondCall.args[0].should.equal(spy.secondCall.thisValue.name);
    });

    it( 'should be empty on the first call', function () {
      spy.firstCall.args[0].should.be.empty;
      spy.secondCall.args[0].should.not.be.empty;
    });

  });

  describe( 'second argument', function () {

    it( 'should equal this.value', function () {
      spy.firstCall.args[1].should.equal(spy.firstCall.thisValue.value);
      spy.secondCall.args[1].should.equal(spy.secondCall.thisValue.value);
    });

    it( 'should be the first genData parameter, on the first call', function () {
      spy.firstCall.args[1].should.equal(thing);
    });

  });

  describe( 'third argument', function () {

    it( 'should be the genData instance, who\'s value sourced this iteration', function () {
      spy.secondCall.args[2].should.equal(spy.firstCall.thisValue);
    });

    it( 'should be undefined on the first call', function () {
      expect(spy.firstCall.args[2]).to.be.undefined;
      expect(spy.secondCall.args[2]).to.not.be.undefined;
    });

  });

  describe( 'fourth argument', function () {

    it( 'should be the iteration object', function () {
      spy.firstCall.args[3]
        .should.be.an('object')
        .and.have.keys(
          'returns',
          'args',
          'continues',
          'breaks',
          'source',
          'params',
          'allowUndefined',
          'loop',
          'queued'
        );
      spy.secondCall.args[3]
        .should.be.an('object')
        .and.have.keys(
          'returns',
          'args',
          'continues',
          'breaks',
          'source',
          'params',
          'allowUndefined',
          'loop',
          'queued'
        );
    });

    it( 'should be shared between callbacks', function () {
      spy.firstCall.args[3].should.equal(spy.secondCall.args[3]);
    });

  });

});