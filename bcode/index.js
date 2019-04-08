const v2 = require('./v2/index')
const v3 = require('./v3/index')
var encode = function(req, e) {
  if (e) {
    // version 2
    return v2.encode(req, e)
  } else {
    // version 3
    return v3.encode(req)
  }
}
var decode = function(req, e) {
  if (e) {
    return v2.decode(req, e)
  } else {
    return v3.decode(req)
  }
}
module.exports = { encode: encode, decode: decode }
