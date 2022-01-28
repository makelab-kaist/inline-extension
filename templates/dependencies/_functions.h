#ifndef __DASH_FUNCTIONS__H__
#define __DASH_FUNCTIONS__H__

#define PAUSE 5
#define _Serial_println _Serial_print

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
  int i;
  double d;
  char c;
  String s;

public:
  SerialWrapper(int a, uint8_t format = DEC) : i(a), fmt(format), tp(INTEGER) {}
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

void printValueFormatted(const SerialWrapper &value, const char *id, uint16_t line, uint16_t index, uint16_t items)
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

// Pins

void _pinMode(uint16_t pin, uint16_t mode, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  pinMode(pin, mode);
  int v = digitalRead(pin);
  printValueFormatted(SerialWrapper(v), id, line, index, items);
}

int _digitalRead(uint16_t pin, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  int v = digitalRead(pin);
  printValueFormatted(SerialWrapper(v), id, line, index, items);
  return v;
}

void _digitalWrite(uint16_t pin, uint16_t value, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  digitalWrite(pin, value);
  int v = digitalRead(pin);
  printValueFormatted(SerialWrapper(v), id, line, index, items);
}

int _analogRead(uint16_t pin, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  int v = analogRead(pin);
  printValueFormatted(SerialWrapper(v), id, line, index, items);
  return v;
}

void _analogWrite(uint16_t pin, uint16_t value, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  analogWrite(pin, value);
  unsigned long highTime = pulseIn(pin, HIGH);
  unsigned long lowTime = pulseIn(pin, LOW);
  unsigned long dutyCycle = (float)(highTime * 100) / (highTime + lowTime);
  String perc = String(dutyCycle) + "%";
  printValueFormatted(SerialWrapper(perc), id, line, index, items);
}

// Time

unsigned long _millis(char *id, uint16_t line, uint16_t index, uint16_t items)
{
  unsigned long m = millis();
  printValueFormatted(SerialWrapper(m), id, line, index, items);
  return m;
}

unsigned long _micros(char *id, uint16_t line, uint16_t index, uint16_t items)
{
  unsigned long m = micros();
  printValueFormatted(SerialWrapper(m), id, line, index, items);
  return m;
}

// Random

long _random(long maxvalue, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  long r = random(maxvalue);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

long _random(long minvalue, long maxvalue, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  long r = random(minvalue, maxvalue);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

// Serial

// print without formatter
void _Serial_print(int value, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  printValueFormatted(SerialWrapper(value), id, line, index, items);
}

void _Serial_print(double value, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  printValueFormatted(SerialWrapper(value), id, line, index, items);
}

void _Serial_print(char value, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  printValueFormatted(SerialWrapper(value), id, line, index, items);
}

void _Serial_print(const String &value, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  printValueFormatted(SerialWrapper(value), id, line, index, items);
}

// print with formatter
void _Serial_print(int value, uint8_t format, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  printValueFormatted(SerialWrapper(value, format), id, line, index, items);
}

void _Serial_print(double value, uint8_t format, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  printValueFormatted(SerialWrapper(value, format), id, line, index, items);
}

void _Serial_print(char value, uint8_t format, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  printValueFormatted(SerialWrapper(value, format), id, line, index, items);
}

// Trigonometry

double _cos(float rad, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  double r = cos(rad);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
double _sin(float rad, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  double r = sin(rad);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

double _tan(float rad, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  double r = tan(rad);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

// Bits and Bytes

uint32_t _bit(uint8_t n, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  uint32_t r = bit(n);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

uint32_t _bitClear(uint32_t x, uint8_t n, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  uint32_t r = bitClear(x, n);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

uint32_t _bitRead(uint32_t x, uint8_t n, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  uint32_t r = bitRead(x, n);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

// void _bitSet(uint32_t &x, uint8_t n, char *id, uint16_t line, uint16_t index, uint16_t items)
// {
//   x |= (1UL << n);
//   printValueFormatted(SerialWrapper(x), id, line, index, items);
// }

// void _bitWrite(uint32_t &x, uint8_t n, uint8_t b, char *id, uint16_t line, uint16_t index, uint16_t items)
// {
//   b ? (x |= (1UL << n)) : bitClear(x, n);
//   printValueFormatted(SerialWrapper(x), id, line, index, items);
// }

uint8_t _highByte(uint16_t x, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  uint8_t r = highByte(x);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}
uint8_t _lowByte(uint16_t x, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  uint8_t r = lowByte(x);
  printValueFormatted(SerialWrapper(r), id, line, index, items);
  return r;
}

// Math
// TODO

// abs()
// constrain()
// map()
// max()
// min()
// pow()
// sq()
// sqrt()

// Advanced I/O
// noTone()
// pulseIn()
// pulseInLong()
// shiftIn()
// shiftOut()
// tone()

// Characters
// isAlpha()
// isAlphaNumeric()
// isAscii()
// isControl()
// isDigit()
// isGraph()
// isHexadecimalDigit()
// isLowerCase()
// isPrintable()
// isPunct()
// isSpace()
// isUpperCase()
// isWhitespace()
#endif