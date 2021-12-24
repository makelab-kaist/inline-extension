# JISON parser generator 

[link](http://zaa.ch/jison/)

To compile the grammars, move to the right folder, then

```
npx jison grammar.jison
```


And here an example of reading a file and parsing it

```js
var parser = require("./grammar").parser;
var fs = require("fs");


var file = fs.readFileSync("test.ino", "utf8");
// console.log(file);

let a = parser.parse(file);
console.log(a);
```