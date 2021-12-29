#ifndef __EXTENSION_HELPERS__H__
#define __EXTENSION_HELPERS__H__

int _digitalRead(const int &pin, const bool nl = true)
{
  int v = digitalRead(pin);
  Serial.print(v);
  if (nl)
    Serial.println("");
  else
    Serial.print(",");
}

int _digitalRead(const int &pin, const unsigned int &line, const bool nl = true)
{
  Serial.print(line);
  Serial.print(",");
  _digitalRead(pin, nl);
}

#endif