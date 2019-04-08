/*
*
*  bcode: a virtual variable approach to encoding
*
*  in v3, we introduce a virtual variable for hex representation of each b-variable, prefixed with "h".
*
*  - All h-prefixed variables are hex encoded.
*  - h-prefixed variables don't actually exist in DB. It's generated on the fly from b-prefixed variables
*
*  So we can instead simply query using the h-variable without the need for a separate encoding schema
*    
*/
const traverse = require('traverse')

/*
*
* = encode =
* 
* Transform a bitdb query into fully base64 encoded version.
*
*   1. Traverse the entire tree
*   2. Find h-prefixed attributes
*   3. Replace them with their base64 counterparts
* 
* Instead of passing a separate second parameter that describes encoding scheme like this:
*
*   bcode.encode({
*     "find": {
*       "out.b0": { "op": 106 },
*       "out.b1": "6d02",
*       "out.s2": "Hello World"
*     }
*   }, {
*     "out.b1": "hex"   //encoding
*   })
*
* We can do this:
*
*   bcode.encode({
*     "find": {
*       "out.b0": { "op": 106 },
*       "out.h1": "6d02",   // encoding is built-in as a virtual variable!
*       "out.s2": "Hello World"
*     }
*   })
*/
var encode = function(req) {
  let copy = { "$root": req }
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
      *     "out.h1": {
      *       "$or": ["6d02", "6d0c"]
      *     }
      *   }
      *
      * 2. the value has a mongdb directive as a key
      *
      *   {
      *     "out.h2": {
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
          if (/^(in|out)\.h[0-9]+/.test(node.key)) {
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
      let m = /^(in|out)\.h([0-9]+)/.exec(node.key)
      let oldKey = node.key;
      if (m) {
        let index = m[2];
        // only transform string
        let key = `${m[1]}.b${m[2]}`;
        if (typeof token === 'string') {
          // base64
          newVal = Buffer.from(token, 'hex').toString('base64')
        }
        // 1. update the current value (b-attribute-tree)
        this.update(newVal)
        // 2. replicate current node to h-key
        node.parent.node[key] = node.node;
        // 3. delete the old h-prefixed tree (need to delete because we'll use this for queries. If not deleted, it will become an AND operation with the newly generated b-prefixed tree)
        node.delete();
      }
    }
  })
  return copy["$root"]
}

/*
*
* = decode =
*
* Find all "b" prefixed variables in the tree
* transform to hex encoding
* and attach them to the same level as the original "b" variable (instead of replacing, like v2)
*
* Transform:
*
*   {
*     "out": [{
*       "i": 0,
*       "b0": { op: 106 },
*       "b1": "bQI="
*       ...
*     }]
*   }
*
* into:
*
*   {
*     "out": [{
*       "i": 0,
*       "b0": { op: 106 },
*       "b1": "bQI="
*       "h1": "6d02"
*       ...
*     }]
*   }
*
* by attaching the hex encoded object to the tree
*
*/
var decode = function(tree) {
  let copy = tree
  traverse(copy).forEach(function(token) {
    if (this.isLeaf) {
      let encoding = "base64"
      let node = this

      /*
      * Unlike encoding, the keys for decoding are
      * the leaf nodes.
      *
      * Therefore just check for b.* instead of out.b.*
      *
      * Then, must attach h-prefix version of that kv pair
      */
      let m = /^b([0-9]+)/.exec(node.key)
      if (m) {
        let index = m[1];
        // only transform string
        if (typeof token === 'string') {
          let hex = Buffer.from(token, 'base64').toString('hex')
          this.parent.node["h" + index] = hex;
        }
      }
    }
  })
  return copy
}
module.exports = {
  encode: encode, decode: decode
}
