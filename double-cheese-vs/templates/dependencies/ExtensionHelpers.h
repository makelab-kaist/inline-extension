#ifndef __EXTENSION_HELPERS__H__
#define __EXTENSION_HELPERS__H__


int _digitalRead(const int &pin, const unsigned int line, const unsigned int index, const bool last = true)
{
  if (index == 0) // first in line
  {
    Serial.print(line);
    Serial.print(",");  
  }

  int v = digitalRead(pin);
  Serial.print(v);
  if (last)
    Serial.println("");
  else
    Serial.print(",");
  return v;
}

int _analogRead(const int &pin, const unsigned int line, const unsigned int index, const bool last = true)
{
  if (index == 0) // first in line
  {
    Serial.print(line);
    Serial.print(",");  
  }

  int v = analogRead(pin);
  Serial.print(v);
  if (last)
    Serial.println("");
  else
    Serial.print(",");
  return v;
}

unsigned long _millis(const unsigned int line, const unsigned int index, const bool last = true)
{
  if (index == 0) // first in line
  {
    Serial.print(line);
    Serial.print(",");  
  }

  unsigned long v = millis();
  Serial.print(v);
  if (last)
    Serial.println("");
  else
    Serial.print(",");
  return v;
}

unsigned long _micros(const unsigned int line, const unsigned int index, const bool last = true)
{
  if (index == 0) // first in line
  {
    Serial.print(line);
    Serial.print(",");  
  }

  unsigned long v = micros();
  Serial.print(v);
  if (last)
    Serial.println("");
  else
    Serial.print(",");
  return v;
}

void _Serialprint(const char* str, const unsigned int line, const unsigned int index, const bool last = true)
{
  if (index == 0) // first in line
  {
    Serial.print(line);
    Serial.print(",");  
  }

  Serial.print(str);
  if (last)
    Serial.println("");
  else
    Serial.print(",");
}

#endif