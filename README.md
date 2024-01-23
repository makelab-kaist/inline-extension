# Inline extension for VSCode

Extension developed for research purposes. Reach out to [makelab-kaist](https://makelab-kaist.kaist.ac.kr) if interested to know more.

## Instructions for installations

1. Run with [VSCode insider](https://code.visualstudio.com/insiders/).

The first time run the command **Preferences: Configure Runtime Arguments** as in [here](https://code.visualstudio.com/api/advanced-topics/using-proposed-api)

```json
    "enable-proposed-api": [
        "makelab-kaist.inline"
    ]
```

2. Install the [inline-server](https://github.com/makelab-kaist/inline-server) and run it in the background (locally or on another machine). The Arduino board should be physically connected to the machine running the _Arduino-server_.

3. Clone this repository or simply download the latest release of the extension (something like `inline-x.x.x.vsix`). You can download the extension from the Extensions tab => `...` menu => Install from VSIX.

![](/images/vsix_install.png)

4. Open an `.ino` file (inside a folder named in the same way: `blink -> blink.ino`).

5. From the side view, select the `Initialize Serial` button in the `INLINE PLAYGROUND` section. Choose the correct serial port and baud rate.

6. Enjoy it!

![](/images/screenshot.png)

## Instructions for development

1. Clone this repository and `cd` into it.

2. Install dependencies with `npm install`.

3. Run the _Arduino-server_ as explained above.

4. Run the command `npm run dev` and then press `F5` from any of the typescript files to test the extension.

5. Enjoy!

### Parser

Parsing is done with [jison](https://gerhobbelt.github.io/jison/docs/).

To allow the js file to be used in typescript, you might need to enable JS in `tsconfig.json` this way.

```json
{
  "compilerOptions": {
    "allowJs": true
  }
}
```
