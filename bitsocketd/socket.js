// Output: SSE
const cors = require("cors")
const express = require("express")
const ip = require("ip")
const { v4: uuid } = require('uuid');
const defaults = { port: 3001 }
const init = function(config) {
  let app = (config.app ? config.app : express())
  let connections = config.connections
  app.use(cors())
  app.use(function (req, res, next) {
    res.sseSetup = function() {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
        "Connection": "keep-alive",
      })
      res.sseSend({ type: "open", data: [] })
    }
    res.sseSend = function(data) {
      res.write("data: " + JSON.stringify(data) + "\n\n")
    }
    res.sseHeartbeat = function() {
      res.write(":heartbeat" + "\n\n")
    }
    next()
  })
  app.get("/s", async function(req, res) {
    try {
      let query = {
        "v": 3, "q": { "find": {} }
      }

      const fingerprint = uuid().split('-')[0]

      res.$fingerprint = fingerprint
      connections.pool[fingerprint] = { res: res, query: query }
      console.log("## Opening from: " + fingerprint)
      //console.log(JSON.stringify(req.headers, null, 2))
      req.on("close", function() {
        console.log("## Closing from: " + res.$fingerprint)
        //console.log(JSON.stringify(req.headers, null, 2))
        delete connections.pool[res.$fingerprint]
        console.log("## Pool size:", Object.keys(connections.pool).length)
      })
    } catch (e) {
      console.error(e)
    }
  })
  app.get(/^\/s\/(.+)/, async function(req, res) {
    try {
      let b64 = req.params[0]

      const fingerprint = uuid().split('-')[0]

      res.sseSetup()
      let json = Buffer.from(b64, "base64").toString()
      let query = JSON.parse(json)
      if (! query.q) {
          query.q = {};
      }

      res.$fingerprint = fingerprint
      connections.pool[fingerprint] = { res: res, query: query }

      console.log("## Opening from: " + fingerprint)
      //console.log(JSON.stringify(req.headers, null, 2))
      req.on("close", function() {
        console.log("## Closing from: " + res.$fingerprint)
        //console.log(JSON.stringify(req.headers, null, 2))
        delete connections.pool[res.$fingerprint]
        console.log("## Pool size:", Object.keys(connections.pool).length)
      })
    } catch (e) {
      console.error(e)
    }
  })
  // if no express app was passed in, need to bootstrap.
  if (!config.app) {
    let port = (config.port ? config.port : defaults.port)
    app.listen(port , function () {
      console.log("######################################################################################")
      console.log("#")
      console.log("#  BITSOCKET: Universal Programmable Bitcoin Push Notifications Network")
      console.log("#  Pushing Bitcoin in realtime through Server Sent Events...")
      console.log("#")
      console.log(`#  API Endpoint: ${ip.address()}:${port}/s`)
      console.log("#")
      console.log("#  Learn more at https://bitsocket.org")
      console.log("#")
      console.log("######################################################################################")
    })
  }

  // set up heartbeat
  setInterval(function() {
    console.log('## Sending heartbeat to ' + Object.keys(connections.pool).length);
    Object.keys(connections.pool).forEach(async function(key) {
      let connection = connections.pool[key]
      connection.res.sseHeartbeat()
    });
  }, (config.heartbeat ? config.heartbeat : 10) * 1000); // every N seconds
}
module.exports = { init: init }
