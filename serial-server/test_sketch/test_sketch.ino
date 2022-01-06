void setup()
{
  delay(500);
  // Serial.begin(115200);
  // Serial.println("Hello world"); //?

  pinMode(9, INPUT);
  digitalWrite(9, LOW);
  pinMode(5, INPUT_PULLUP);
}

void loop()
{
  int a = analogRead(2) + digitalRead(5); //?

  // if (digitalRead(5) == 1)
  // {
  //   Serial.println("hello");
  // }
}
