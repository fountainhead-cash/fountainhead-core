# bigjq

A [node-jq](https://github.com/sanack/node-jq) plugin to enable big arguments

# why?

When using the node-jq library it fails if the input is too large. 

It would be ideal if the original [node-jq](https://github.com/sanack/node-jq) repository implemented this feature but it doesn't look like it's going to happen any time soon.

# how?

jq has an option to accept stdin as input, and this doesn't have a limit.

This library makes use of that feature and creates an abstraction on top of node-jq.

> You don't need to install node-jq separately because it's automatically installed as a dependency when you install this library.

# usage

```
const jq = require('fountainhead-core').bigjq
jq.run(filter, data)
.then(function(result) {
  console.log("result = ", result)
})
.catch(function(e) {
  console.log("error = ", e)
})
```
