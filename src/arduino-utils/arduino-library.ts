/**
 * The instrumented Arduino code
 */
const library = new Map<string, string>();

// Pins

library.set(
  'pinMode',
  `
void _pinMode(uint8_t pin, uint8_t mode, PARAMS)
{
  pinMode(pin, mode);
  int v = digitalRead(pin);
  printValueFormatted(SerialWrapper(v), id, line, index, items);
}`
);

library.set(
  'digitalWrite',
  `
void _digitalWrite(uint8_t pin, uint8_t value, PARAMS)
{
  digitalWrite(pin, value);
  int v = digitalRead(pin);
  printValueFormatted(SerialWrapper(v), id, line, index, items);
}
`
);

library.set(
  'digitalRead',
  `
int _digitalRead(uint8_t pin, PARAMS)
{
  int v = digitalRead(pin);
  printValueFormatted(SerialWrapper(v), id, line, index, items);
  return v;
}
`
);

library.set(
  'analogRead',
  `
int _analogRead(uint8_t pin, PARAMS)
{
  int v = analogRead(pin);
  printValueFormatted(SerialWrapper(v), id, line, index, items);
  return v;
}
`
);

library.set(
  'analogWrite',
  `
void _analogWrite(uint8_t pin, int value, PARAMS)
{
  analogWrite(pin, value);
  if (value == 0){
    printValueFormatted(SerialWrapper(0), id, line, index, items);
    return;
  }else if (value % 255 == 0){
    printValueFormatted(SerialWrapper(100), id, line, index, items);
    return;
  }  
  unsigned long highTime = pulseIn(pin, HIGH);
  unsigned long lowTime = pulseIn(pin, LOW);
  unsigned long dutyCycle = (float)(highTime * 100) / (highTime + lowTime);
  printValueFormatted(SerialWrapper(dutyCycle), id, line, index, items);
}
`
);

// Time

library.set(
  'delay',
  `
void _delay(unsigned long ms, PARAMS)
{
  printValueFormatted(SerialWrapper(ms), id, line, index, items);
  delay(ms);
}
`
);

library.set(
  'millis',
  `
unsigned long _millis(PARAMS)
{
  unsigned long m = millis();
  printValueFormatted(SerialWrapper(m), id, line, index, items);
  return m;
}
`
);

library.set(
  'micros',
  `
unsigned long _micros(PARAMS)
{
  unsigned long m = micros();
  printValueFormatted(SerialWrapper(m), id, line, index, items);
  return m;
}
`
);

library.set(
  'pulseIn',
  `
unsigned long _pulseIn(uint8_t pin, uint8_t state, unsigned long timeout, PARAMS)
{
  unsigned long m = pulseIn(pin, state, timeout);
  printValueFormatted(SerialWrapper(m), id, line, index, items);
  return m;
}

unsigned long _pulseIn(uint8_t pin, uint8_t state, PARAMS)
{
  unsigned long m = pulseIn(pin, state, 1000000UL);
  printValueFormatted(SerialWrapper(m), id, line, index, items);
  return m;
}
`
);

// Random / map

library.set(
  'random',
  `
long _random(long maxvalue, PARAMS)
{
  long r = random(maxvalue);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

long _random(long minvalue, long maxvalue, PARAMS)
{
  long r = random(minvalue, maxvalue);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
`
);

library.set(
  'map',
  `
long _map(long x, long in_min, long in_max, long out_min, long out_max, PARAMS)
{
  long m = map(x, in_min, in_max, out_min, out_max);
  printValueFormatted(SerialWrapper(m), id, line, index, items);
  return m;
}
`
);

// Math

library.set(
  'min',
  `
long _min(long a, long b, PARAMS)
{
  long r = min(a, b);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

double _min(double a, double b, PARAMS)
{
  double r = min(a, b);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
`
);

library.set(
  'max',
  `
long _max(long a, long b, PARAMS)
{
  long r = max(a, b);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

double _max(double a, double b, PARAMS)
{
  double r = max(a, b);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
`
);

library.set(
  'abs',
  `
long _abs(long a, PARAMS)
{
  long r = abs(a);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

double _abs(double a, PARAMS)
{
  double r = abs(a);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
`
);

library.set(
  'round',
  `
long _round(double a, PARAMS)
{
  long r = round(a);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
`
);

library.set(
  'radians',
  `
double _radians(double deg, PARAMS)
{
  double r = radians(deg);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
`
);

library.set(
  'degrees',
  `
double _degrees(double rad, PARAMS)
{
  double r = degrees(rad);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
`
);

library.set(
  'sq',
  `
double _sq(double a, PARAMS)
{
  double r = sq(a);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
`
);

library.set(
  'sqrt',
  `
double _sqrt(double a, PARAMS)
{
  double r = sqrt(a);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
`
);

library.set(
  'constrain',
  `
long _constrain(long amt, long low, long high, PARAMS)
{
  long r = constrain(amt, low, high);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

double _constrain(double amt, double low, double high, PARAMS)
{
  double r = constrain(amt, low, high);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
`
);

library.set(
  'cos',
  `
double _cos(float rad, PARAMS)
{
  double r = cos(rad);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
`
);

library.set(
  'sin',
  `
double _sin(float rad, PARAMS)
{
  double r = sin(rad);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
`
);

library.set(
  'tan',
  `
double _tan(float rad, PARAMS)
{
  double r = tan(rad);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
`
);

// Characters

library.set(
  'isAlphaNumeric',
  `
boolean _isAlphaNumeric(int c, PARAMS)
{
  boolean b = isAlphaNumeric(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}
`
);

library.set(
  'isAlpha',
  `
boolean _isAlpha(int c, PARAMS)
{
  boolean b = isAlpha(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}
`
);

library.set(
  'isAscii',
  `
boolean _isAscii(int c, PARAMS)
{
  boolean b = isAscii(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}
`
);

library.set(
  'isWhitespace',
  `
boolean _isWhitespace(int c, PARAMS)
{
  boolean b = isWhitespace(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}
`
);

library.set(
  'isControl',
  `
boolean _isControl(int c, PARAMS)
{
  boolean b = isControl(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}
`
);

library.set(
  'isDigit',
  `
boolean _isDigit(int c, PARAMS)
{
  boolean b = isDigit(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}
`
);

library.set(
  'isGraph',
  `
boolean _isGraph(int c, PARAMS)
{
  boolean b = isGraph(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}

`
);

library.set(
  'isLowerCase',
  `
boolean _isLowerCase(int c, PARAMS)
{
  boolean b = isLowerCase(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}
`
);

library.set(
  'isPrintable',
  `
boolean _isPrintable(int c, PARAMS)
{
  boolean b = isPrintable(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}
`
);

library.set(
  'isPunct',
  `
boolean _isPunct(int c, PARAMS)
{
  boolean b = isPunct(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}
`
);

library.set(
  'isSpace',
  `
boolean _isSpace(int c, PARAMS)
{
  boolean b = isSpace(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}
`
);

library.set(
  'isUpperCase',
  `
boolean _isUpperCase(int c, PARAMS)
{
  boolean b = isUpperCase(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}
`
);

library.set(
  'isHexadecimalDigit',
  `
boolean _isHexadecimalDigit(int c, PARAMS)
{
  boolean b = isHexadecimalDigit(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}
`
);

library.set(
  'toAscii',
  `
int _toAscii(int c, PARAMS)
{
  int i = toAscii(c);
  printValueFormatted(SerialWrapper(i), id, line, index, items);
  return i;
}
`
);

library.set(
  'toLowerCase',
  `
int _toLowerCase(int c, PARAMS)
{
  int i = toLowerCase(c);
  printValueFormatted(SerialWrapper(i), id, line, index, items);
  return i;
}
`
);

library.set(
  'toUpperCase',
  `
int _toUpperCase(int c, PARAMS)
{
  int i = toUpperCase(c);
  printValueFormatted(SerialWrapper(i), id, line, index, items);
  return i;
}
`
);

// Bits and Bytes

library.set(
  'bit',
  `
long _bit(long n, PARAMS)
{
  long r = bit(n);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
`
);

library.set(
  'bitClear',
  `
long _bitClear(long value, uint8_t bit, PARAMS)
{
  long r = bitClear(value, bit);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
`
);

library.set(
  'bitRead',
  `
long _bitRead(long value, uint8_t bit, PARAMS)
{
  long r = bitRead(value, bit);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
`
);

library.set(
  'bitSet',
  `
#define _bitSet(value, bit, id, line, index, items) ({ bitSet(value, bit); printValueFormatted(SerialWrapper(value), id, line, index, items); })
`
);

library.set(
  'bitToggle',
  `
#define _bitToggle(value, bit, id, line, index, items) ({  bitToggle(value, bit); printValueFormatted(SerialWrapper(value), id, line, index, items); })
`
);

library.set(
  'bitWrite',
  `
#define _bitWrite(value, bit, bitvalue, id, line, index, items) ({ bitWrite(value, bit, bitvalue);  printValueFormatted(SerialWrapper(value), id, line, index, items); })
`
);

library.set(
  'highByte',
  `
uint8_t _highByte(long w, PARAMS)
{
  uint8_t r = highByte(w);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
`
);

library.set(
  'lowByte',
  `
uint8_t _lowByte(long w, PARAMS)
{
  uint8_t r = lowByte(w);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
`
);

// Advanced I/O

library.set(
  'shiftIn',
  `
uint8_t _shiftIn(uint8_t dataPin, uint8_t clockPin, uint8_t bitOrder, PARAMS)
{
  uint8_t r = shiftIn(dataPin, clockPin, bitOrder);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
`
);

library.set(
  'shiftOut',
  `
char *int2bin(unsigned int x, uint8_t bitOrder)
{
  static char buffer[9];
  for (int i = 0; i < 8; i++)
    if (bitOrder == MSBFIRST)
      buffer[7 - i] = '0' + ((x & (1 << i)) > 0);
    else if (bitOrder == LSBFIRST)
      buffer[i] = '0' + ((x & (1 << i)) > 0);

  buffer[8] = ' ';
  return buffer;
}

void _shiftOut(uint8_t dataPin, uint8_t clockPin, uint8_t bitOrder, uint8_t val, PARAMS)
{
  shiftOut(dataPin, clockPin, bitOrder, val);
  printValueFormatted(SerialWrapper(int2bin(val, bitOrder)), id, line, index, items);
}
`
);

library.set(
  'tone',
  `
long getFrequency(int pin)
{
  // the more sample, the more accurate, yet slower
#define SAMPLES 3
  long freq = 0;
  for (unsigned int j = 0; j < SAMPLES; j++)
    freq += 500000 / pulseIn(pin, HIGH, 250000);
  return freq / SAMPLES;
}

void _tone(uint8_t pin, unsigned int frequency, unsigned long duration, PARAMS)
{
  tone(pin, frequency, duration);
  long freq = getFrequency(pin);
  printValueFormatted(SerialWrapper(freq), id, line, index, items);
}

void _tone(uint8_t pin, unsigned int frequency, PARAMS)
{
  _tone(pin, frequency, 0, id, line, index, items);
}
`
);

function getCodeParts(functions: string[]) {
  let code = '';
  for (const fun of functions) {
    if (fun.includes('Serial')) continue; // serial is included
    if (!library.has(fun)) throw new Error(`${fun}: invalid function name`);
    code += library.get(fun);
  }
  return code;
}

export const generateLibraryCode = (functions: string[]) => `
#ifndef __DASH_FUNCTIONS__H__
#define __DASH_FUNCTIONS__H__

// See reference:  https://github.com/arduino/ArduinoCore-avr/blob/master/cores/arduino/Arduino.h

#define PAUSE 5
#define _Serial_println _Serial_print
#define _pulseInLong _pulseIn

#define PARAMS char *id, uint16_t line, uint8_t index, uint8_t items

enum ContentType
{
  INTEGER,
  FLOAT,
  STRING,
};

class SerialWrapper
{
private:
  ContentType tp;
  uint8_t fmt;
  long i;
  double d;
  char c;
  String s;

public:
  SerialWrapper(long a, uint8_t format = DEC) : i(a), fmt(format), tp(INTEGER) {}
  SerialWrapper(char a, uint8_t format) : s(String(a)), tp(STRING) {} // format will be ignored
  SerialWrapper(double a, uint8_t format) : d(a), tp(FLOAT) {}        // format will be ignored
  SerialWrapper(const String &a) : s(a), tp(STRING) {}

  void print()
  {
    switch (tp)
    {
    case INTEGER:
      Serial.print(i, fmt);
      break;
    case FLOAT:
      Serial.print(d);
      break;
    case STRING:
      Serial.print("\\"");
      Serial.print(s);
      Serial.print("\\"");
      break;
    }
  }

  void println()
  {
    print();
    Serial.println("");
  }
};

void printValueFormatted(const SerialWrapper &value, PARAMS)
{
  if (index == 1) // first in line
  {
    Serial.print("$");
    Serial.print(id);
    Serial.print(",");
    Serial.print(line);
    Serial.print(",");
  }

  value.print();

  if (index == items)
  {
    Serial.println("");
    delay(PAUSE);
  }
  else
    Serial.print(",");
}

void _Serial_begin(unsigned long value, PARAMS)
{
  Serial.begin(115200);
  printValueFormatted(SerialWrapper(value), id, line, index, items);
}

void _Serial_print(int value, PARAMS)
{
  printValueFormatted(SerialWrapper(value), id, line, index, items);
}

void _Serial_print(long value, PARAMS)
{
  printValueFormatted(SerialWrapper(value), id, line, index, items);
}

void _Serial_print(double value, PARAMS)
{
  printValueFormatted(SerialWrapper(value), id, line, index, items);
}

void _Serial_print(char value, PARAMS)
{
  printValueFormatted(SerialWrapper(String(value)), id, line, index, items);
}

void _Serial_print(const String &value, PARAMS)
{
  printValueFormatted(SerialWrapper(value), id, line, index, items);
}

// print with formatter

void _Serial_print(long value, uint8_t format, PARAMS)
{
  printValueFormatted(SerialWrapper(value, format), id, line, index, items);
}

void _Serial_print(double value, uint8_t format, PARAMS)
{
  printValueFormatted(SerialWrapper(value, format), id, line, index, items);
}

void _Serial_print(char value, uint8_t format, PARAMS)
{
  printValueFormatted(SerialWrapper(value, format), id, line, index, items);
}

${getCodeParts(functions)}

#endif // __DASH_FUNCTIONS__H__
`;
