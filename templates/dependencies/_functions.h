#ifndef __DASH_FUNCTIONS__H__
#define __DASH_FUNCTIONS__H__

#include "_serial.h"

#define PAUSE 5

void printValueFormatted(uint16_t value, const char *id, uint16_t line, uint16_t index, uint16_t items)
{
  if (index == 1) // first in line
  {
    Serial.print("$");
    Serial.print(id);
    Serial.print(",");
    Serial.print(line);
    Serial.print(",");
  }

  Serial.print(value);

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
  printValueFormatted(v, id, line, index, items);
}

int _digitalRead(uint16_t pin, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  int v = digitalRead(pin);
  printValueFormatted(v, id, line, index, items);
  return v;
}

void _digitalWrite(uint16_t pin, uint16_t value, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  digitalWrite(pin, value);
  int v = digitalRead(pin);
  printValueFormatted(v, id, line, index, items);
}

int _analogRead(uint16_t pin, char *id, uint16_t line, uint16_t index, uint16_t items)
{
  int v = analogRead(pin);
  printValueFormatted(v, id, line, index, items);
  return v;
}

unsigned long _millis(char *id, uint16_t line, uint16_t index, uint16_t items)
{
  unsigned long m = millis();
  printValueFormatted(m, id, line, index, items);
  return m;
}

unsigned long _micros(char *id, uint16_t line, uint16_t index, uint16_t items)
{
  unsigned long m = micros();
  printValueFormatted(m, id, line, index, items);
  return m;
}

#endif