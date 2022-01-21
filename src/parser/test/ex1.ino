void setup()
{
    Serial.begin(115200);
    int a = digitalRead(9) + digitalRead(A0 - (12));
    Serial.println("Hello world");
}

void loop()
{
    int a = digitalRead(9) + digitalRead(A0 - (12));
}