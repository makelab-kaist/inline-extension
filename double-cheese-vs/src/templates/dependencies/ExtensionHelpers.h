#ifndef __EXTENSION_HELPERS__H__
#define __EXTENSION_HELPERS__H__

int _digitalRead(const int &pin, const unsigned int &id, const unsigned int &lineNumber)
{
  // dr,id,value,lineNumber
  int v = digitalRead(pin);
  Serial.print("dr,");
  Serial.print(id);
  Serial.print(",");
  Serial.print(v);
  Serial.print(",");
  Serial.println(lineNumber);
}

int _analogRead(const int &pin, const unsigned int &id, const unsigned int &lineNumber)
{
  // dr,id,value,lineNumber
  int v = analogRead(pin);
  Serial.print("ar,");
  Serial.print(id);
  Serial.print(",");
  Serial.print(v);
  Serial.print(",");
  Serial.println(lineNumber);
}

#endif