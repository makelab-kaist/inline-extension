# JISON parser generator

[link](http://zaa.ch/jison/)

To compile the grammars, move to the right folder, then

```
npx jison grammar.jison
```

And here an example of reading a file and parsing it

```js
var parser = require('./grammar').parser;
var fs = require('fs');

var file = fs.readFileSync('test.ino', 'utf8');
// console.log(file);

let a = parser.parse(file);
console.log(a);
```

## Supported Arduino functions

```cpp
// Pins

pinMode
digitalWrite
digitalRead
analogRead
analogWrite

// Time

millis
micros
pulseIn

// Random

random
map

// Math

min
max
abs
round
radians
degrees
sq
sqrt
constrain
cos
sin
tan

// Characters

isAlphaNumeric
isAlpha
isAscii
isWhitespace
isControl
isDigit
isGraph
isLowerCase
isPrintable
isPunct
isSpace
isUpperCase
isHexadecimalDigit
toAscii
toLowerCase
toUpperCase


// Serial

Serialprint


// Bits and Bytes

bit
bitClear
bitRead
bitSet
bitToggle
bitWrite
highByte
lowByte


// Advanced I/O

shiftIn
shiftOut
tone
```
