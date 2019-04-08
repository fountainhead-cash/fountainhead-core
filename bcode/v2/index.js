const traverse = require('traverse')
var encode = function(req, encoding_schema) {
  let copy = req
  traverse(copy).forEach(function(token) {
    if (this.isLeaf) {
      let encoding = "utf8"
      let newVal = token
      let node = this
      /*
      *
      * Step 1. Check for edge cases
      *
      * Sometimes can't just look for out.b* or in.b* keys
      * and decide that its direct children are the values that
      * need to be encoded. For example:
      *
      * 1. the value is an array item
      *
      *   {
      *     "out.b1": {
      *       "$or": ["6d02", "6d0c"]
      *     }
      *   }
      *
      * 2. the value has a mongdb directive as a key
      *
      *   {
      *     "out.b2": {
      *       "$not": "6d02"
      *     }
      *   }
      *
      * When we come across one of these values,
      * We need to backtrack to the closest ancestor
      * which has the key "out.b*" or "in.b*"
      * If one exists, we know that the values at hand
      * need to be encoded. Otherwise, ignore.
      *
      */
      if (/^([0-9]+|\$).*/.test(node.key)) {
        while(!node.isRoot) {
          node = node.parent
          if (/^(in|out)\.b[0-9]+/.test(node.key)) {
            break
          }
        }
      }

      /*
      *
      * Step 2. Transform
      *
      * Only if there's an ancestor with in.b* or out.b*
      *
      */
      if (/^(in|out)\.b[0-9]+/.test(node.key)) {
        if (encoding_schema && encoding_schema[node.key]) {
          encoding = encoding_schema[node.key]
        }
        // only transform string
        if (typeof token === 'string') {
          newVal = Buffer.from(token, encoding).toString('base64')
        } else {
          newVal = token;
        }
      }
      this.update(newVal)
    }
  })
  return copy
}
var decode = function(subtree, encoding_schema) {
  let copy = subtree
  traverse(copy).forEach(function(token) {
    if (this.isLeaf) {
      let encoding = "base64"
      let newVal = token
      let node = this
      if (/^([0-9]+|\$).*/.test(node.key)) {
        while(!node.isRoot) {
          node = node.parent
          if (/^(in|out)\.b[0-9]+/.test(node.key)) {
            break
          }
        }
      }
      /*
      * because the encoding def takes the form of:
      * { out.b1: 'hex' }
      * we can't just take the full path and match.
      *
      * For example
      *
      * {
      *   "out": [{
      *     "i": 0,
      *     "b0": { op: 106 },
      *     ...
      *   }, {
      *     "i": 1,
      *     "b0": { op: 169 },
      *     ...
      *   }]
      * }
      *
      * Extracting out the paths from this object results:
      *
      *   out[0].b0 and out[1].b0
      * 
      * We need to ignore the number key so it's:
      *
      *   out.b0
      */
      let currentKey = node.path.filter(function(p) {
        return !/^[0-9]+$/.test(p)
      }).join(".")

      // In case of decoding, we start with leaf node keys
      // therefore don't need to check for "out.b*" or "in.b*"
      // Instead just check for the 

      /*
      * Unlike encoding, the keys for decoding are
      * the leaf nodes.
      *
      * Therefore just check for b.* instead of out.b.*
      */
      if (/^b[0-9]+/.test(node.key)) {
        if (encoding_schema && encoding_schema[currentKey]) {
          encoding = encoding_schema[currentKey]
        }
        // only transform string
        if (typeof token === 'string') {
          newVal = Buffer.from(token, 'base64').toString(encoding)
        } else {
          newVal = token
        }
      }
      this.update(newVal)
    }
  })
  return copy
}
module.exports = {
  encode: encode, decode: decode
}
