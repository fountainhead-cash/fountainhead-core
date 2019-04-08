// Input: ZMQ
const zmq = require("zeromq")
const mingo = require("mingo")
const bcode = require("../bcode")
const jq = require("../bigjq")
const BigNumber = require('bignumber.js')
const defaults = { host: "127.0.0.1", port: 28339 }
const init = function(config) {
  let sock = zmq.socket("sub")
  let host = (config.host ? config.host : defaults.host)
  let port = (config.port ? config.port : defaults.port)
  let connections = config.connections
  sock.connect("tcp://" + host + ":" + port)
  sock.subscribe("mempool")
  sock.subscribe("mempool-slp-genesis")
  sock.subscribe("mempool-slp-send")
  sock.subscribe("mempool-slp-mint")
  sock.subscribe("block")
  sock.subscribe("block-slp-genesis")
  sock.subscribe("block-slp-send")
  sock.subscribe("block-slp-mint")
  sock.on("message", async function(topic, message) {
    let type = topic.toString()
    let o = message.toString()
    if (config.verbose) {
      console.log(message);
    }
    // TODO change this to be more efficient when schema finalized
    function convert_numberdecimal_to_string(o) {
      for (const i in o) {
        if (o[i] !== null && typeof(o[i]) === "object") {
          if (o[i].hasOwnProperty('$numberDecimal')) {
            o[i] = new BigNumber(o[i]['$numberDecimal'].toString()).toFixed()
          }
          convert_numberdecimal_to_string(o[i])
        }
      }
    }
    switch (type) {
      case "mempool": {
        let tx = JSON.parse(o)
        console.log(tx)
        Object.keys(connections.pool).forEach(async function(key) {
          let connection = connections.pool[key]
          const encoded = bcode.encode(connection.query)
          const types = encoded.q.db
          if (!types || types.indexOf("u") >= 0) {
            let filter = new mingo.Query(encoded.q.find)
            if (filter.test(tx)) {
              let decoded = bcode.decode(tx)
			  convert_numberdecimal_to_string(decoded)
              let result
              try {
                if (encoded.r && encoded.r.f) {
                  result = await jq.run(encoded.r.f, [decoded])
                } else {
                  result = [decoded]
                }
              } catch (e) {
                console.log("Error", e)
              }
              connection.res.sseSend({ type: type, data: result })
            }
          }
        })
        break
      }
      case "block": {
        let block = JSON.parse(o)
        console.log(block)
        Object.keys(connections.pool).forEach(async function(key) {
          let connection = connections.pool[key]
          const encoded = bcode.encode(connection.query)
          console.log(encoded)
          const types = encoded.q.db
          if (!types || types.indexOf("c") >= 0) {
            let filter = new mingo.Query(encoded.q.find)
            let filtered = block.txns.filter(function(tx) {
              return filter.test(tx)
            })
            let transformed = []
            for(let i=0; i<filtered.length; i++) {
              let tx = filtered[i]
              let decoded = bcode.decode(tx)
			  convert_numberdecimal_to_string(decoded)
              let result
              try {
                if (encoded.r && encoded.r.f) {
                  result = await jq.run(encoded.r.f, [decoded])
                } else {
                  result = decoded
                }
                transformed.push(result)
              } catch (e) {
                console.log("Error", e)
              }
            }
            connection.res.sseSend({
              type: type, index: block.i, data: transformed 
            })
          }
        })
        break
      }
    }
  })
}
module.exports = { init: init }
