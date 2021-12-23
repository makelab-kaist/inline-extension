"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArduinoPlatform = exports.ArduinoCli = exports.ArduinoBoard = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = require("vscode");
const util_1 = require("util");
const exec = (0, util_1.promisify)(require('child_process').exec);
// Default platforms
var ArduinoPlatform;
(function (ArduinoPlatform) {
    ArduinoPlatform["avr"] = "arduino:avr";
})(ArduinoPlatform || (ArduinoPlatform = {}));
exports.ArduinoPlatform = ArduinoPlatform;
// Default baords
var ArduinoBoard;
(function (ArduinoBoard) {
    ArduinoBoard["Arduino_Uno"] = "arduino:avr:uno";
    ArduinoBoard["Adafruit_CircuitPlayground"] = "arduino:avr:circuitplay32u4cat";
    ArduinoBoard["Arduino_BT"] = "arduino:avr:bt";
    ArduinoBoard["Arduino_Duemilanove_or_Diecimila"] = "arduino:avr:diecimila";
    ArduinoBoard["Arduino_Esplora"] = "arduino:avr:esplora";
    ArduinoBoard["Arduino_Ethernet"] = "arduino:avr:ethernet";
    ArduinoBoard["Arduino_Fio"] = "arduino:avr:fio";
    ArduinoBoard["Arduino_Gemma"] = "arduino:avr:gemma";
    ArduinoBoard["Arduino_Industrial_101"] = "arduino:avr:chiwawa";
    ArduinoBoard["Arduino_Leonardo"] = "arduino:avr:leonardo";
    ArduinoBoard["Arduino_Leonardo_ETH"] = "arduino:avr:leonardoeth";
    ArduinoBoard["Arduino_Mega_ADK"] = "arduino:avr:megaADK";
    ArduinoBoard["Arduino_Mega_or_Mega_2560"] = "arduino:avr:mega";
    ArduinoBoard["Arduino_Micro"] = "arduino:avr:micro";
    ArduinoBoard["Arduino_Mini"] = "arduino:avr:mini";
    ArduinoBoard["Arduino_NG_or_older"] = "arduino:avr:atmegang";
    ArduinoBoard["Arduino_Nano"] = "arduino:avr:nano";
    ArduinoBoard["Arduino_Pro_or_Pro_Mini"] = "arduino:avr:pro";
    ArduinoBoard["Arduino_Robot_Control"] = "arduino:avr:robotControl";
    ArduinoBoard["Arduino_Robot_Motor"] = "arduino:avr:robotMotor";
    ArduinoBoard["Arduino_Uno_Mini"] = "arduino:avr:unomini";
    ArduinoBoard["Arduino_Uno_WiFi"] = "arduino:avr:unowifi";
    ArduinoBoard["Arduino_Yun"] = "arduino:avr:yun";
    ArduinoBoard["Arduino_Yun_Mini"] = "arduino:avr:yunmini";
    ArduinoBoard["LilyPad_Arduino"] = "arduino:avr:lilypad";
    ArduinoBoard["LilyPad_Arduino_USB"] = "arduino:avr:LilyPadUSB";
    ArduinoBoard["Linino_One"] = "arduino:avr:one";
})(ArduinoBoard || (ArduinoBoard = {}));
exports.ArduinoBoard = ArduinoBoard;
class ArduinoCli {
    constructor() {
        this.ready = false;
    }
    static getInstance() {
        if (!ArduinoCli.instance)
            this.instance = new ArduinoCli();
        return this.instance;
    }
    init(fqbn, portName) {
        this.fqbn = fqbn;
        this.portName = portName;
        this.ready = true;
    }
    get platform() {
        this.checkIfReady();
        return this.fqbn.toString();
    }
    get port() {
        this.checkIfReady();
        return this.portName;
    }
    /**
     * Get version of Arduino-cli
     * @returns {Promise<string>} containing the stdout
     */
    version() {
        return this.run(`version`, this.root());
    }
    /**
     * Check whether the Arduino-cli is installed
     * @returns true or false whether it is installed or not
     */
    async isInstalled() {
        try {
            await this.run('', this.root());
            return true;
        }
        catch (err) {
            return false; // if it fails, it is not installed
        }
    }
    /**
     * Install the platform via `arduino-cli core install`
     * @param board - the board used to infer which platform to isntall
     * @returns a string containing the stdout
     */
    installPlatform(platform) {
        return this.run(`core install ${platform}`, this.root());
    }
    /**
     * Install the platform via `arduino-cli core install` for the current baord
     * @returns a string containing the stdout
     */
    installCurrentPlatform() {
        const platform = this.fqbn
            .split(':')
            .slice(0, 2)
            .join(':'); // arduino:avr:uno -> arduino:avr
        // return this.installPlatform(this.fqbn);
        return this.installPlatform(platform);
    }
    compileSketch(sketchFolder) {
        if (!sketchFolder)
            throw new Error(`Sketch folder ${sketchFolder} is invalid`);
        this.checkIfReady(); // will throw an error if not initialized
        return this.run(`compile -b ${this.fqbn}`, sketchFolder);
    }
    uploadSketch(sketchFolder) {
        if (!sketchFolder)
            throw new Error(`Sketch folder ${sketchFolder} is invalid`);
        this.checkIfReady(); // will throw an error if not initialized
        return this.run(`upload --port ${this.portName} --fqbn ${this.fqbn}`, sketchFolder);
    }
    listAvailablePorts() {
        return new Promise(async (resolve) => {
            const res = await this.run(`board list --format json`, this.root());
            const resObj = JSON.parse(res);
            const ports = resObj.map((val) => val.port.address);
            resolve(ports);
        });
    }
    // Private methods
    root() {
        return vscode.Uri.file('/');
    }
    checkIfReady() {
        if (!this.ready)
            throw new Error(`Arduino board not initalized`);
    }
    /**
     *
     * @param command - the command to execute appended to `arduino-cli`
     * @param baseDirectoryPath - the location of the sketch (default none)
     * @returns a string containing the stdout
     */
    run(command, baseDirectoryPath) {
        return new Promise(async (res, rej) => {
            const workingDir = { cwd: baseDirectoryPath.fsPath };
            try {
                const { stdout, stderr } = await exec(`arduino-cli ${command}`, workingDir);
                if (stdout)
                    res(stdout);
                else
                    res(stderr);
            }
            catch (err) {
                rej(`Error: ${err}`);
            }
        });
    }
}
exports.ArduinoCli = ArduinoCli;
//# sourceMappingURL=arduino-cli.js.map