#ifndef __DASH_SERIAL__H__
#define __DASH_SERIAL__H__

enum ContentType
{
    INTEGER,
    FLOAT,
    STRING,
};

class Wrapper
{
private:
    ContentType tp;
    uint8_t fmt;
    int i;
    double d;
    char c;
    String s;

public:
    Wrapper(int a, uint8_t format = DEC) : i(a), fmt(format), tp(INTEGER) {}
    Wrapper(char a, uint8_t format) : s(String(a)), tp(STRING) {} // format will be ignored
    Wrapper(double a, uint8_t format) : d(a), tp(FLOAT) {}        // format will be ignored
    Wrapper(String a) : s(a), tp(STRING) {}

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

void _Serial_print(int value, uint8_t format, char *id, uint16_t line, uint16_t index, uint16_t items)
{
    if (index == 1) // first in line
    {
        Serial.print("$");
        Serial.print(id);
        Serial.print(",");
        Serial.print(line);
        Serial.print(",");
    }

    Wrapper(value, format).print();

    if (index == items)
    {
        Serial.println("");
        delay(PAUSE);
    }
    else
        Serial.print(",");
}

#endif