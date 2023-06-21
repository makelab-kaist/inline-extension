# Inline extension for VSCode (code name _double-cheese_)

Extension develped for reasearch purpose. Reach out to [MAKinteract](https://makinteract.kaist.ac.kr) if interested to know more.

## Instructions for installations

1. Run with [VSCode insider](https://code.visualstudio.com/insiders/).

The first time run the command **Preferences: Configure Runtime Arguments** as in [here](https://code.visualstudio.com/api/advanced-topics/using-proposed-api)

```json
	"enable-proposed-api": [
		"MAKinteract.double-cheese"
	],
```

2. Install the [arduino-server](https://github.com/makinteract/arduino-server) and run it in the background (locally or or another machine). The Arduino board should be physically connected to the machine running the arduino-server.

3. Clone this repository or simply download the latest release of the extension (somethig like `double-cheese-x.x.x.vsix`). You can dowload the extension from the Extensions tab => `...` menu => Install from VSIX.

![](/images/vsix_install.png)

4. Open an `ino` file (inside a folder named in the same way: `blink -> blink.ino`).

5. From the side view, select the `Initialize Serial` button in the `INLINE PLAYGROUND` section. Choose the correct serial port and baud rate.

6. Enjoy it!

![](/images/screenshot.png)
