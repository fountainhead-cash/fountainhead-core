const spawn = require('child_process').spawn;
var getPath = function() {
  return process.cwd() + '/node_modules/node-jq/bin/jq'
}
var run = function(filter, data, log_result=true) {
  const child = spawn(getPath(), [filter]);
  return new Promise(function(resolve, reject) {
    let chunks = [];
    child.stdout.on('data', (chunk) => {
      chunks.push(chunk)
    });
    child.stdout.on('end', () => {
      let str = chunks.join("");
      if(log_result)
        console.log("STR = ", str)
      try {
        let parsed = JSON.parse(str);
        resolve(parsed)
      } catch (e) {
        reject(e)
      }
    })
    child.stdout.on('error', (err) => {
      reject(err)
    })

    child.stdin.setEncoding('utf-8');
    child.stdin.write(JSON.stringify(data));
    child.stdin.end()
  })
}
module.exports = { run: run }
