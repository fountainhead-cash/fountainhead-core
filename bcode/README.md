# bcode

encoding handler for bitdb

# How it works

bcode is a self-contained data format that 

## 1. encode

> Encode all BitDB Query attributes to base64

Takes all the h-prefixed variables in a query and REPLACES them with their bas64 counterpart. Example:

```
bcode.encode({
  "v": 3,
  "q": {
    "find": {
      "out.b0": { "op": 106 },
      "out.h1": "6d02",
      "out.s2": "Hello World"
    }
  }
})
```

returns

```
{
  "v": 3,
  "q": {
    "find": {
      "out.b0": { "op": 106 },
      "out.b1": "bQI=",
      "out.s2": "SGVsbG8gd29ybGQ="
    }
  }
}
```

Note that the `out.h1` from the source is gone, and replaced with `out.b1`.

## 2. decode

> Find all base64 encoded b-attributes and ATTACH (not replace) their hex encoded version to the same level in the tree


```
bcode.decode({
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
```

returns the following (includes h2, as well as b2):

```
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
}
```
