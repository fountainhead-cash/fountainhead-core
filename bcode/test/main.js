const assert = require('assert');
const rewire = require('rewire')
const diff = require('deep-diff').diff;
const bcode = rewire('../index');
const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);
const should = chai.should();
const expect = chai.expect;

var mock;
const comp = function(actual, expected) {
  let difference = diff(actual, expected)
  assert.equal(typeof difference, 'undefined')
}
describe('index', function() {
  beforeEach(function() {
    mock = {
      v2: {
        encode: chai.spy(),
        decode: chai.spy()
      },
      v3: {
        encode: chai.spy(),
        decode: chai.spy()
      }
    };
    bcode.__set__('v2', mock.v2);
    bcode.__set__('v3', mock.v3);
  })
  it('calling encode() without encoding should call v2', function() {
    bcode.encode({
      "find": {}
    }, {
      "out.b1": "6d02"
    })
    expect(mock.v2.encode).to.have.been.called.with({
      "find": {}
    }, {
      "out.b1": "6d02"
    });
    expect(mock.v3.encode).to.not.have.been.called();
  })
  it('calling encode() with encoding should call v3', function() {
    bcode.encode({
      "find": {}
    })
    expect(mock.v2.encode).to.not.have.been.called();
    expect(mock.v3.encode).to.have.been.called.with({
      "find": {}
    })
  })
  it('calling decode() without encoding should call v2', function() {
    bcode.decode({
      "b1": "bQI="
    }, {
      "out.b1": "6d02"
    })
    expect(mock.v2.decode).to.have.been.called.with({
      "b1": "bQI="
    }, {
      "out.b1": "6d02"
    });
    expect(mock.v3.decode).to.not.have.been.called();
  })
  it('calling decode() with encoding should call v3', function() {
    bcode.decode({
      "b1": "bQI="
    })
    expect(mock.v2.decode).to.not.have.been.called();
    expect(mock.v3.decode).to.have.been.called.with({
      "b1": "bQI="
    });
  })
}) 
