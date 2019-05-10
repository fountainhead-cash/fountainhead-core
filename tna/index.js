require('dotenv').config()
const bch = require('bitcore-lib-cash')
const RpcClient = require('bitcoind-rpc');
var fromHash = function(hash, config) {
  let c;
  if (config) {
    c = config;
  } else {
    c = {
      protocol: 'http',
      user: process.env.rpc_user ? process.env.rpc_user : 'root',
      pass: process.env.rpc_pass ? process.env.rpc_pass : 'bitcoin',
      host: process.env.rpc_host ? process.env.rpc_host : '127.0.0.1',
      port: process.env.rpc_port ? process.env.rpc_port : '8332',
    }
  }
  
  const rpc = new RpcClient(c)
  return new Promise(function(resolve, reject) {
    rpc.getRawTransaction(hash, async function(err, transaction) {
      if (err) {
        console.log("Error: ", err)
      } else {
        let result = await fromTx(transaction.result);
        resolve(result);
      }
    })
  })
}
var fromGene = function(gene, options) {
  return new Promise(function(resolve, reject) {
    let t = gene.toObject()
    let result = [];
    let inputs = [];
    let outputs = [];
    let graph = {};
    let atasks = [];
    if (gene.inputs) {
      gene.inputs.forEach(function(input, input_index) {
        if (input.script) {
          let xput = { i: input_index }
          input.script.chunks.forEach(function(c, chunk_index) {
            let chunk = c;
            if (c.buf) {
              const key_prefix = (c.buf.length >= 512) ? 'l' : '';

              xput[key_prefix + "b" + chunk_index] = c.buf.toString('base64')
              if (options && options.h && options.h > 0) {
                xput[key_prefix + "h" + chunk_index] = c.buf.toString('hex')
              }
            } else {
              if (typeof c.opcodenum !== 'undefined') {
                xput["b" + chunk_index] = {
                  op: c.opcodenum
                }
              } else {
                const key_prefix = (c.length >= 512) ? 'l' : '';
                xput[key_prefix + "b" + chunk_index] = c;
              }
            }
          })
          xput.str = input.script.toASM()
          let sender = {
            h: input.prevTxId.toString('hex'),
            i: input.outputIndex
          }
          let address = input.script.toAddress(bch.Networks.livenet).toString(bch.Address.CashAddrFormat).split(':')[1];
          if (address && address.length > 0) {
            sender.a = address;
          } else {
            atasks.push(new Promise(function(resolve, reject) {
              return fromHash(sender.h).then(function(tx) {
                sender.a = tx.out[sender.i].e.a;
                resolve(sender.a);
              });
            }));
          }
          xput.e = sender;
          inputs.push(xput)
        }
      })
    }
    if (gene.outputs) {
      gene.outputs.forEach(function(output, output_index) {
        if (output.script) {
          let xput = { i: output_index }
          output.script.chunks.forEach(function(c, chunk_index) {
            let chunk = c;
            if (c.buf) {
              const key_prefix = (c.buf.length >= 512) ? 'l' : '';

              xput[key_prefix + "b" + chunk_index] = c.buf.toString('base64')
              xput[key_prefix + "s" + chunk_index] = c.buf.toString('utf8')
              if (options && options.h && options.h > 0) {
                xput[key_prefix + "h" + chunk_index] = c.buf.toString('hex')
              }
            } else {
              if (typeof c.opcodenum !== 'undefined') {
                xput["b" + chunk_index] = {
                  op: c.opcodenum
                }
              } else {
                const key_prefix = (c.length >= 512) ? 'l' : '';
                xput[key_prefix + "b" + chunk_index] = c;
              }
            }
          })
          xput.str = output.script.toASM()
          let receiver = {
            v: output.satoshis,
            i: output_index
          }
          let address = output.script.toAddress(bch.Networks.livenet).toString(bch.Address.CashAddrFormat).split(':')[1];
          if (address && address.length > 0) {
            receiver.a = address;
          }
          xput.e = receiver;
          outputs.push(xput)
        }
      })
    }
    Promise.all(atasks)
    .then(function(data) {
      resolve({
        tx: { h: t.hash },
        in: inputs,
        out: outputs
      })
    });
  })
}
var fromTx = function(transaction, options) {
  return fromGene(new bch.Transaction(transaction), options);
}

module.exports = {
  fromHash: fromHash,
  fromGene: fromGene,
  fromTx: fromTx
}
