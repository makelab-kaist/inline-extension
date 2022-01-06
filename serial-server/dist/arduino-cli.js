"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArduinoPlatform = exports.ArduinoCli = exports.ArduinoBoard = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const util_1 = require("util");
const fs_1 = __importDefault(require("fs"));
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
    isInstalled() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.run('', this.root());
                return true;
            }
            catch (err) {
                return false; // if it fails, it is not installed
            }
        });
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
    compileAndUpload(sketchPath) {
        return new Promise((resolve, reject) => {
            let report = 'DONE: ';
            this.compileSketch(sketchPath)
                .then((msg) => {
                report += msg;
                return this.uploadSketch(sketchPath);
            })
                .then((msg) => {
                resolve(report);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
    compileSketch(sketchPath) {
        if (!fs_1.default.existsSync(sketchPath))
            throw new Error(`Sketch folder ${sketchPath} is invalid`);
        this.checkIfReady(); // will throw an error if not initialized
        return this.run(`compile -b ${this.fqbn}`, sketchPath);
    }
    uploadSketch(sketchPath) {
        if (!fs_1.default.existsSync(sketchPath))
            throw new Error(`Sketch folder ${sketchPath} is invalid`);
        this.checkIfReady(); // will throw an error if not initialized
        return this.run(`upload --port ${this.portName} --fqbn ${this.fqbn}`, sketchPath);
    }
    listAvailablePorts() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const res = yield this.run(`board list --format json`, this.root());
            const resObj = JSON.parse(res);
            const ports = resObj.map((val) => val.port.address);
            resolve(ports);
        }));
    }
    // Private methods
    root() {
        return '/';
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
        return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
            const workingDir = { cwd: baseDirectoryPath };
            try {
                const { stdout, stderr } = yield exec(`arduino-cli ${command}`, workingDir);
                if (stdout)
                    res(stdout);
                else
                    res(stderr);
            }
            catch (err) {
                rej(`Error: ${err}`);
            }
        }));
    }
}
exports.ArduinoCli = ArduinoCli;
//# sourceMappingURL=arduino-cli.js.map