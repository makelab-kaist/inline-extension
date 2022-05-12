"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.libCode = void 0;
exports.libCode = `

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
      Serial.print(s);
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

////////////////////////////////////////////////////////////////////////////////////////
// Wrappers
////////////////////////////////////////////////////////////////////////////////////////

// Pins

void _pinMode(uint8_t pin, uint8_t mode, PARAMS)
{
  pinMode(pin, mode);
  int v = digitalRead(pin);
  printValueFormatted(SerialWrapper(v), id, line, index, items);
}

void _digitalWrite(uint8_t pin, uint8_t value, PARAMS)
{
  digitalWrite(pin, value);
  int v = digitalRead(pin);
  printValueFormatted(SerialWrapper(v), id, line, index, items);
}

int _digitalRead(uint8_t pin, PARAMS)
{
  int v = digitalRead(pin);
  printValueFormatted(SerialWrapper(v), id, line, index, items);
  return v;
}

int _analogRead(uint8_t pin, PARAMS)
{
  int v = analogRead(pin);
  printValueFormatted(SerialWrapper(v), id, line, index, items);
  return v;
}

void _analogWrite(uint8_t pin, int value, PARAMS)
{
  analogWrite(pin, value);
  if (value == 255){
    printValueFormatted(SerialWrapper("100%"), id, line, index, items);
    return;
  }
  unsigned long highTime = pulseIn(pin, HIGH);
  unsigned long lowTime = pulseIn(pin, LOW);
  unsigned long dutyCycle = (float)(highTime * 100) / (highTime + lowTime);
  String perc = String(dutyCycle) + "%";
  printValueFormatted(SerialWrapper(perc), id, line, index, items);
}

// Time

unsigned long _millis(PARAMS)
{
  unsigned long m = millis();
  printValueFormatted(SerialWrapper(m), id, line, index, items);
  return m;
}

unsigned long _micros(PARAMS)
{
  unsigned long m = micros();
  printValueFormatted(SerialWrapper(m), id, line, index, items);
  return m;
}

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

// Random

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

long _map(long x, long in_min, long in_max, long out_min, long out_max, PARAMS)
{
  long m = map(x, in_min, in_max, out_min, out_max);
  printValueFormatted(SerialWrapper(m), id, line, index, items);
  return m;
}

// Math

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

long _round(double a, PARAMS)
{
  long r = round(a);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

double _radians(double deg, PARAMS)
{
  double r = radians(deg);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

double _degrees(double rad, PARAMS)
{
  double r = degrees(rad);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

double _sq(double a, PARAMS)
{
  double r = sq(a);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

double _sqrt(double a, PARAMS)
{
  double r = sqrt(a);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

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

double _cos(float rad, PARAMS)
{
  double r = cos(rad);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

double _sin(float rad, PARAMS)
{
  double r = sin(rad);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

double _tan(float rad, PARAMS)
{
  double r = tan(rad);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

// Characters

boolean _isAlphaNumeric(int c, PARAMS)
{
  boolean b = isAlphaNumeric(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}

boolean _isAlpha(int c, PARAMS)
{
  boolean b = isAlpha(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}

boolean _isAscii(int c, PARAMS)
{
  boolean b = isAscii(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}

boolean _isWhitespace(int c, PARAMS)
{
  boolean b = isWhitespace(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}

boolean _isControl(int c, PARAMS)
{
  boolean b = isControl(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}

boolean _isDigit(int c, PARAMS)
{
  boolean b = isDigit(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}

boolean _isGraph(int c, PARAMS)
{
  boolean b = isGraph(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}

boolean _isLowerCase(int c, PARAMS)
{
  boolean b = isLowerCase(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}

boolean _isPrintable(int c, PARAMS)
{
  boolean b = isPrintable(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}

boolean _isPunct(int c, PARAMS)
{
  boolean b = isPunct(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}

boolean _isSpace(int c, PARAMS)
{
  boolean b = isSpace(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}

boolean _isUpperCase(int c, PARAMS)
{
  boolean b = isUpperCase(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}

boolean _isHexadecimalDigit(int c, PARAMS)
{
  boolean b = isHexadecimalDigit(c);
  printValueFormatted(SerialWrapper(b), id, line, index, items);
  return b;
}

int _toAscii(int c, PARAMS)
{
  int i = toAscii(c);
  printValueFormatted(SerialWrapper(i), id, line, index, items);
  return i;
}

int _toLowerCase(int c, PARAMS)
{
  int i = toLowerCase(c);
  printValueFormatted(SerialWrapper(i), id, line, index, items);
  return i;
}

int _toUpperCase(int c, PARAMS)
{
  int i = toUpperCase(c);
  printValueFormatted(SerialWrapper(i), id, line, index, items);
  return i;
}

// Serial

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

// Bits and Bytes

long _bit(long n, PARAMS)
{
  long r = bit(n);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

long _bitClear(long value, uint8_t bit, PARAMS)
{
  long r = bitClear(value, bit);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

long _bitRead(long value, uint8_t bit, PARAMS)
{
  long r = bitRead(value, bit);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

#define _bitSet(value, bit, id, line, index, items) ({                 bitSet(value, bit);                                                  printValueFormatted(SerialWrapper(value), id, line, index, items); })

#define _bitToggle(value, bit, id, line, index, items) ({              bitToggle(value, bit);                                               printValueFormatted(SerialWrapper(value), id, line, index, items); })

#define _bitWrite(value, bit, bitvalue, id, line, index, items) ({     bitWrite(value, bit, bitvalue);                                      printValueFormatted(SerialWrapper(value), id, line, index, items); })

uint8_t _highByte(long w, PARAMS)
{
  uint8_t r = highByte(w);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

uint8_t _lowByte(long w, PARAMS)
{
  uint8_t r = lowByte(w);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

// Advanced I/O

uint8_t _shiftIn(uint8_t dataPin, uint8_t clockPin, uint8_t bitOrder, PARAMS)
{
  uint8_t r = shiftIn(dataPin, clockPin, bitOrder);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

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

#endif // __DASH_FUNCTIONS__H__

`;
//# sourceMappingURL=inoCodeTemplate.js.map