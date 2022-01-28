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

#endif