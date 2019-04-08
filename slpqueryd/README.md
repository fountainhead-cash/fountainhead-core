# slpqueryd

## 1. What is slpquery?

slpquery is a **Turing complete query language for building immutable API on Bitcoin**.

It is a fork of bitquery to enable querying [SLP](https://simpleledger.cash) tokens. 

![f](./img/f.png)

slpquery is a **portable**, **self-contained**, and **programmable** query language that lets you:

1. **Query** bitcoin (via [SLPDB](https://slpdb.fountainhead.cash)) using a [mongodb query language](https://docs.mongodb.com/manual/tutorial/query-documents/)
2. **Process** the result using [jq](https://en.wikipedia.org/wiki/Jq_(programming_language)), a turing complete functional programming language
3. All within a single **self-contained declarative query language**.

![q](./img/q.png)

Top level attributes:

- v: version
- q: query (MongoDB query)
- r: response handler (powered by [jq](https://stedolan.github.io/jq/))

> Learn more here: [https://docs.fountainhead.cash](https://docs.fountainhead.cash)

With this combination, you can create your own custom API that's:

- **portable:** written in JSON, it's natively supported by all devices, OS, programming languages, and databases.
- **self-contained:** since the processing function can transform the query result into any format, the query can act as a high level API.
- **programmable:** combine with other queries to build apps that talk to one another based on bitcoin state

## 2. Build your own API from Bitcoin!

Here's a simple slpquery (You can learn more about the syntax [here](https://docs.fountainhead.cash/query))

```
{
  "v": 3,
  "q": {
    "find": { "out.h1": "6d0c" },
    "project": { "out.$": 1 }
  }
}
```

When you send the query to a slpdb node, it will respond with the following result:

![raw](./img/raw.png)

Already super useful, but it's still raw because every item in the response is a full transaction.

We can go further by adding a **processing** step:


```
{
  "v": 3,
  "q": {
    "find": { "out.h1": "6d0c" },
    "project": {
      "out.$": 1
    }
  },
  "r": {
    "f": "[ [ .[] | .out[0] ] | group_by(.s2)[] | { topic: .[0].s2, messages: [ .[] | .s3 ] } ]"
  }
}
```

The `"r.f"` is written in [jq](https://stedolan.github.io/jq/), a [Turing complete](https://github.com/MakeNowJust/bf.jq) data processing language.

Thanks to this additional step, this will respond with:

![api](./img/api.png)

To summarize, with slpquery:

1. **Flexible Query:** You can write a portable JSON query to read from the blockchain.
2. **Response Processing:** You can also add additional step to represent the processing logic, which will return your own custom immutable stream of data from bitcoin, or also known as **API**.
2. **Interoperable:** When you mix and match these APIs together, you can create applications that trigger and talk to one another in a deterministic manner.

---

# slpqueryd

## 1. What is slpqueryd?

slpqueryd is a query engine that:

1. Connects to a [SLPDB](https://slpdb.fountainhead.cash) node and
2. Let you interact with SLPDB using the **slpquery** language.


## 2. prerequisites

slpqueryd is a query engine that directly interfaces with a BitDB node. You must have direct access to a BitDB node through either a local or remote MongoDB URL. (An HTTP based module to come soon)

> This library is for connecting directly to a BitDB MongoDB instance through `mongodb://` url and is not for HTTP access. If you're looking for a public HTTP endpoint, this library is not what you're looking for. You can instead use the HTTP-based API endpoint at [slpdb.fountainhead.cash](https://slpdb.fountainhead.cash), which takes only a couple of minutes to get your app up and running.

## 3. usage

First initialize, and use the returned db object to make the query. 

### A. Using Promises


```
var slpqueryd = require('fountainhead-core').slpqueryd
var bql = {
  "v": 3,
  "q": {
    "find": { "out.h1": "6d02" },
    "limit": 50
  },
  "r": {
    "f": "[.[] | .out[0] | {h1: .h1, s2: .s2} ]"
  }
}
slpqueryd.init().then(function(db) {
  db.read(bql).then(function(response) {
    console.log("Response = ", response)
  })
})
```

### B. Using Async-Await

```
var slpqueryd = require('fountainhead-core').slpqueryd
var bql = {
  "v": 3,
  "q": {
    "find": { "out.h1": "6d02" },
    "limit": 50
  },
  "r": {
    "f": "[.[] | .out[0] | {h1: .h1, s2: .s2} ]"
  }
};
(async function () {
  let db = await slpqueryd.init();
  let response = await db.read(bql);
  console.log("Response = ", response)
})();
```

> Note: By default slpquery connects to `mongodb://localhost:27017` so you don't need to configure anything if you set up BitDB without changing anything.


## 4. configuration

You can set the following two options:

1. **url:** BitDB Node URL
2. **timeout:** Request timeout

### A. url

Select the BitDB URL to connect to. 

```
slpqueryd.init({
  url: "mongodb://localhost:27017"
}).then(function(db) {
  ...
})
```

### B. timeout

Set request timeout in milliseconds. All BitDB requests will time out after this duration.

```
slpqueryd.init({
  timeout: 20000
}).then(function(db) {
  ...
})
```
