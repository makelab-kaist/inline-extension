var parser = require("../grammar").parser;
var fs = require("fs");


var file = fs.readFileSync("test.ino", "utf8");
// console.log(file);

const out = parser.parse(file);
console.log(out);