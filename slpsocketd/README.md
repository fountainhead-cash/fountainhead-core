# slpsocketd

message bus for SLP

# Prerequisites

slpsocketd has a dependency on SLPDB.

[Install SLPDB](https://github.com/simpleledger/SLPDB)

# Usage

## 1. Basic

If you already have SLPDB running on port 28339, you can simply do this:

```
git clone https://github.com/fountainhead-cash/slpsockserve
cd slpsockserve
npm install
cp .env.example .env
$(EDITOR) .env
npm start
```

You will see a screen like this:

![init](img/bitsocket_init.png)

Now open your browser to the socket URL and you'll see SSE pouring in.

![browser](img/raw.gif)

That's the raw firehose. You probably don't want to consume the whole thing, so make sure to add a bitquery filter. Learn more at [https://docs.fountainhead.cash](https://docs.fountainhead.cash)

## 2. Custom SLPDB node

You can specify the Zeromq subscriber from a SLPDB node, like this:

```
const slpsocketd = require('fountainhead-slpsocketd')
slpsocketd.init({
  bit: { host: "127.0.0.1", port: 28339 },
})
```

By default SLPDB's zeromq publisher broadcasts to [port 28339](https://github.com/simpleledger/SLPDB/blob/master/config.ts), but you can customize if you want.


## 3. Custom SSE port

By default, the SSE port is automatically 3001. You can customize this:

```
const slpsocketd = require('fountainhead-core').slpsocketd
slpsocketd.init({
  socket: { port: 3001 }
})
```

## 4. Use an existing express.js server

```
// Step 1. express.js web server init
const express = require("express")
const app = express()
app.listen(3000 , function () {
  console.log("web server listening at " + port)
})

// Step 2. pass the express server to bitsocketd
const slpsocketd = require('fountainhead-core').slpsocketd
slpsocketd.init({
  socket: { app: app }
})
```
