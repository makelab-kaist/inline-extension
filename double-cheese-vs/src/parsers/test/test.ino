void setup()
{
    Serial.begin(115200);
    pinMode(9, INPUT_PULLUP);
}

void loop()
{
    int a = digitalRead(9);
}