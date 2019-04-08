const assert = require('assert');
const diff = require('deep-diff').diff;
const bcode = require('../v3/index')
const comp = function(actual, expected) {
  let difference = diff(actual, expected)
  assert.equal(typeof difference, 'undefined')
}
describe('v3', function() {
  describe('decode', function() {
    it('should decode correctly', function() {
      let src = [{
        out: {
          unconfirmed: [{
            b0: {
              op: 106
            },
            b1: "bQI="
          }]
        }
      }];
      let actual = bcode.decode(src)
      let expected = [{
        out: {
          unconfirmed: [{
            b0: {
              op: 106
            },
            b1: "bQI=",
            h1: "6d02"
          }]
        }
      }];
      comp(actual, expected)
    })
    it('should include other attributes like s correctly', function() {
      let src = [{
        out: {
          unconfirmed: [{
            b0: {
              op: 106
            },
            b1: "bQI=",
            b2: "aGVsbG8gd29ybGQ=",
            s2: "hello world"
          }]
        }
      }];
      let actual = bcode.decode(src)
      let expected = [{
        out: {
          unconfirmed: [{
            b0: {
              op: 106
            },
            b1: "bQI=",
            h1: "6d02",
            b2: "aGVsbG8gd29ybGQ=",
            s2: "hello world",
            h2: "68656c6c6f20776f726c64"
          }]
        }
      }];
      comp(actual, expected)
    })
    it('example', function() {
      let actual = bcode.decode({
        "i": 1,
        "b0": {
          "op": 118
        },
        "b1": {
          "op": 169
        },
        "b2": "C4xgCn8EKdAewSF/r3mR0I3zeG4=",
        "s2": "\u000b�`\n^?\u0004)�\u001e�!^?�y�Ѝ�xn",
        "b3": {
          "op": 136
        },
        "b4": {
          "op": 172
        },
        "str": "<Script: OP_DUP OP_HASH160 20 0x0b8c600a7f0429d01ec1217faf7991d08df3786e OP_EQUALVERIFY OP_CHECKSIG>",
        "e": {
          "v": 50591402,
          "i": 1,
          "a": "qq9cccq20uzzn5q7cyshltmej8ggmumcdc9deqqsa7"
        }
      })
      let expected = {
        "i": 1,
        "b0": {
          "op": 118
        },
        "b1": {
          "op": 169
        },
        "b2": "C4xgCn8EKdAewSF/r3mR0I3zeG4=",
        "h2": "0b8c600a7f0429d01ec1217faf7991d08df3786e",
        "s2": "\u000b�`\n^?\u0004)�\u001e�!^?�y�Ѝ�xn",
        "b3": {
          "op": 136
        },
        "b4": {
          "op": 172
        },
        "str": "<Script: OP_DUP OP_HASH160 20 0x0b8c600a7f0429d01ec1217faf7991d08df3786e OP_EQUALVERIFY OP_CHECKSIG>",
        "e": {
          "v": 50591402,
          "i": 1,
          "a": "qq9cccq20uzzn5q7cyshltmej8ggmumcdc9deqqsa7"
        }
      }
      comp(actual, expected)
    })
    it('nested example', function() {
      let actual = bcode.decode({
        "tx": {
          "h": "2badece3bcda4ce8649eacc2f4ecb3753dd4f8e47510bb74f4429821aa4f7844"
        },
        "in": [
          {
            "i": 0,
            "b0": "MEQCIEAwB9hBQi967jv7Q+/ZgdEZfY03/uThJ2R/vCV5PVUiAiACNqPEWX/RqCOmMBGdVLeD9Vbk7Jp6wEfqbmmmGfw3zUE=",
            "b1": "AiKIJ8eCnbncipo4XQi2nDvnt30dpUmj2KY1t6hoaQkv",
            "str": "<Script: 71 0x30440220403007d841422f7aee3bfb43efd981d1197d8d37fee4e127647fbc25793d552202200236a3c4597fd1a823a630119d54b783f556e4ec9a7ac047ea6e69a619fc37cd41 33 0    x02228827c7829db9dc8a9a385d08b69c3be7b77d1da549a3d8a635b7a86869092f>",
            "e": {
              "h": "ada059b72bb6c547e0141316fb908885e3d00633c0e1a9594ad07bad1c01e0cd",
              "i": 1,
              "a": "qq9cccq20uzzn5q7cyshltmej8ggmumcdc9deqqsa7"
            }
          }
        ],
        "out": [
          {
            "i": 0,
            "b0": {
              "op": 106
            },
            "b1": "CHdoYwAAAAAAAAABAAAAIuyyXAA=",
            "s1": "\bwhc\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0001\u0000\u0000\u0000\"�\\\u0000",
            "str": "<Script: OP_RETURN 20 0x08776863000000000000000100000022ecb25c00>",
            "e": {
              "v": 0,
              "i": 0
            }
          },
          {
            "i": 1,
            "b0": {
              "op": 118
            },
            "b1": {
              "op": 169
            },
            "b2": "C4xgCn8EKdAewSF/r3mR0I3zeG4=",
            "s2": "\u000b�`\n^?\u0004)�\u001e�!^?�y�Ѝ�xn",
            "b3": {
              "op": 136
            },
            "b4": {
              "op": 172
            },
            "str": "<Script: OP_DUP OP_HASH160 20 0x0b8c600a7f0429d01ec1217faf7991d08df3786e OP_EQUALVERIFY OP_CHECKSIG>",
            "e": {
              "v": 50591402,
              "i": 1,
              "a": "qq9cccq20uzzn5q7cyshltmej8ggmumcdc9deqqsa7"
            }
          },
          {
            "i": 2,
            "b0": {
              "op": 118
            },
            "b1": {
              "op": 169
            },
            "b2": "R3V/WpKoZU5om8tKXTYJQJOvi8A=",
            "s2": "Gu^?Z��eNh��J]6\t@����",
            "b3": {
              "op": 136
            },
            "b4": {
              "op": 172
            },
            "str": "<Script: OP_DUP OP_HASH160 20 0x47757f5a92a8654e689bcb4a5d36094093af8bc0 OP_EQUALVERIFY OP_CHECKSIG>",
            "e": {
              "v": 546,
              "i": 2,
              "a": "qprh2l66j25x2nngn0955hfkp9qf8tutcqwdwuzsuf"
            }
          }
        ]
      })
      let expected = {
        "tx": {
          "h": "2badece3bcda4ce8649eacc2f4ecb3753dd4f8e47510bb74f4429821aa4f7844"
        },
        "in": [
          {
            "i": 0,
            "b0": "MEQCIEAwB9hBQi967jv7Q+/ZgdEZfY03/uThJ2R/vCV5PVUiAiACNqPEWX/RqCOmMBGdVLeD9Vbk7Jp6wEfqbmmmGfw3zUE=",
            "h0": "30440220403007d841422f7aee3bfb43efd981d1197d8d37fee4e127647fbc25793d552202200236a3c4597fd1a823a630119d54b783f556e4ec9a7ac047ea6e69a619fc37cd41",
            "b1": "AiKIJ8eCnbncipo4XQi2nDvnt30dpUmj2KY1t6hoaQkv",
            "h1": "02228827c7829db9dc8a9a385d08b69c3be7b77d1da549a3d8a635b7a86869092f",
            "str": "<Script: 71 0x30440220403007d841422f7aee3bfb43efd981d1197d8d37fee4e127647fbc25793d552202200236a3c4597fd1a823a630119d54b783f556e4ec9a7ac047ea6e69a619fc37cd41 33 0    x02228827c7829db9dc8a9a385d08b69c3be7b77d1da549a3d8a635b7a86869092f>",
            "e": {
              "h": "ada059b72bb6c547e0141316fb908885e3d00633c0e1a9594ad07bad1c01e0cd",
              "i": 1,
              "a": "qq9cccq20uzzn5q7cyshltmej8ggmumcdc9deqqsa7"
            }
          }
        ],
        "out": [
          {
            "i": 0,
            "b0": {
              "op": 106
            },
            "b1": "CHdoYwAAAAAAAAABAAAAIuyyXAA=",
            "h1": "08776863000000000000000100000022ecb25c00",
            "s1": "\bwhc\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0001\u0000\u0000\u0000\"�\\\u0000",
            "str": "<Script: OP_RETURN 20 0x08776863000000000000000100000022ecb25c00>",
            "e": {
              "v": 0,
              "i": 0
            }
          },
          {
            "i": 1,
            "b0": {
              "op": 118
            },
            "b1": {
              "op": 169
            },
            "b2": "C4xgCn8EKdAewSF/r3mR0I3zeG4=",
            "h2": "0b8c600a7f0429d01ec1217faf7991d08df3786e",
            "s2": "\u000b�`\n^?\u0004)�\u001e�!^?�y�Ѝ�xn",
            "b3": {
              "op": 136
            },
            "b4": {
              "op": 172
            },
            "str": "<Script: OP_DUP OP_HASH160 20 0x0b8c600a7f0429d01ec1217faf7991d08df3786e OP_EQUALVERIFY OP_CHECKSIG>",
            "e": {
              "v": 50591402,
              "i": 1,
              "a": "qq9cccq20uzzn5q7cyshltmej8ggmumcdc9deqqsa7"
            }
          },
          {
            "i": 2,
            "b0": {
              "op": 118
            },
            "b1": {
              "op": 169
            },
            "b2": "R3V/WpKoZU5om8tKXTYJQJOvi8A=",
            "h2": "47757f5a92a8654e689bcb4a5d36094093af8bc0",
            "s2": "Gu^?Z��eNh��J]6\t@����",
            "b3": {
              "op": 136
            },
            "b4": {
              "op": 172
            },
            "str": "<Script: OP_DUP OP_HASH160 20 0x47757f5a92a8654e689bcb4a5d36094093af8bc0 OP_EQUALVERIFY OP_CHECKSIG>",
            "e": {
              "v": 546,
              "i": 2,
              "a": "qprh2l66j25x2nngn0955hfkp9qf8tutcqwdwuzsuf"
            }
          }
        ]
      }
      comp(actual, expected)
    })
    it('should not delete if the top level attribute is being mutated', function() {
      let src = {
        b0: {
          op: 106
        },
        b1: "bQI=",
        b2: "aGVsbG8gd29ybGQ=",
        s2: "hello world"
      };
      let expected = {
        b0: {
          op: 106
        },
        b1: "bQI=",
        h1: "6d02",
        b2: "aGVsbG8gd29ybGQ=",
        s2: "hello world",
        h2: "68656c6c6f20776f726c64"
      };
      let actual = bcode.decode(src)
      comp(actual, expected)
    })
  })
  describe('encode', function() {
    it('should transform out.h* attributes', function() {
      let src = {
        v: 3,
        q: {
          find: {
            "out.h1": "6d02"
          }
        }
      }
      let expected = {
        v: 3,
        q: {
          find: {
            "out.b1": Buffer.from("6d02", "hex").toString("base64")
          }
        }
      }
      let actual = bcode.encode(src)
      comp(actual, expected)
    })
    it('should transform out.h* attributes inside an array', function() {
      let src = {
        v: 3,
        q: {
          find: {
            "out.h1": ["6d02", "6d0c"]
          }
        }
      }
      let expected = {
        v: 3,
        q: {
          find: {
            "out.b1": [
              Buffer.from("6d02", "hex").toString("base64"),
              Buffer.from("6d0c", "hex").toString("base64")
            ]
          }
        }
      }
      let actual = bcode.encode(src)
      comp(actual, expected)
    })
    it('should transform out.h* attributes inside $regex', function() {
      let src = {
        v: 3,
        q: {
          find: {
            "out.h1": {
              "$not": "6d02"
            }
          }
        }
      }
      let expected = {
        v: 3,
        q: {
          find: {
            "out.b1": {
              $not: Buffer.from("6d02", "hex").toString("base64")
            }
          }
        }
      }
      let actual = bcode.encode(src)
      comp(actual, expected)
    })


    it("should NOT transform non-string objects", function() {
      let src = {
        v: 3,
        q: {
          find: {
            "out.h1": {
              $exists: true
            }
          }
        }
      }
      let encoding = { "out.h1": "hex" }
      let expected = {
        v: 3,
        q: {
          find: {
            "out.b1": {
              $exists: true
            }
          }
        }
      }
      let actual = bcode.encode(src)
      comp(actual, expected)
    })

    it("should transform objects correctly", function() {
      let actual = bcode.encode({
        "v": 3,
        "q": {
          "find": {
            "out.b0": { "op": 106 },
            "out.h1": "6d02",
            "out.s2": "Hello World"
          }
        }
      })
      let expected = {
        "v": 3,
        "q": {
          "find": {
            "out.b0": { "op": 106 },
            "out.b1": "bQI=",
            "out.s2": "Hello World"
          }
        }
      }
      comp(actual, expected)
    })

    it('should not delete if the top level attribute is being mutated', function() {
      let actual = bcode.encode({
        "out.b0": { "op": 106 },
        "out.h1": "6d02",
        "out.s2": "Hello World"
      })
      let expected = {
        "out.b0": { "op": 106 },
        "out.b1": "bQI=",
        "out.s2": "Hello World"
      }
      comp(actual, expected)
    })
  });

});

