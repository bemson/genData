var
  genData = require('../src/gendata'),
  sinon = require('sinon'),
  chai = require('chai'),
  sinonChai = require('sinon-chai')
;

chai.use(sinonChai);
chai.should();

global.genData = genData;
global.sinon = sinon;
global.expect = chai.expect;