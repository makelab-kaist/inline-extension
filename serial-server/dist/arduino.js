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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Arduino = void 0;
const arduino_cli_1 = require("./arduino-cli");
const serial_1 = require("./serial");
class Arduino {
    constructor() {
        this._board = arduino_cli_1.ArduinoBoard.Arduino_Uno;
    }
    static getInstance() {
        if (!Arduino.instance)
            this.instance = new Arduino();
        return this.instance;
    }
    /**
     * Get the list of ports
     * @returns {string[]}
     */
    listSerialPorts() {
        return arduino_cli_1.ArduinoCli.getInstance().listAvailablePorts();
    }
    /**
     * Initialize (and connect) to serial
     * @param port the port
     * @param baud baud rate
     * @param onDataReadCallback the callabck to be called when serial gets data
     * @param autoconnect
     * @returns
     */
    begin(port, baud, onDataReadCallback, autoconnect) {
        var _a;
        // already connected -> ignore
        if ((_a = this._serial) === null || _a === void 0 ? void 0 : _a.isSerialConnected())
            return new Promise((_, reject) => reject('Alraedy connected'));
        // Init the CLI
        arduino_cli_1.ArduinoCli.getInstance().initialize(port, this._board);
        // Init serial
        this._serial = new serial_1.SimpleSerial(port, baud, onDataReadCallback);
        // Autoconnect?
        if (autoconnect) {
            return this.connect(); // might throw an error
        }
        // Return an empty promise
        return new Promise((res) => res('Board initialized'));
    }
    /**
     * Connect to serial
     * @returns {Promise<string>} possible errors
     */
    connect() {
        var _a, _b;
        if (!this._serial)
            return new Promise((_, reject) => reject('Board not initialized'));
        if ((_a = this._serial) === null || _a === void 0 ? void 0 : _a.isSerialConnected())
            return new Promise((_, reject) => reject('Board already connected'));
        return (_b = this._serial) === null || _b === void 0 ? void 0 : _b.connectSerial();
    }
    /**
     * Disconnect  serial
     * @returns {string} message if disconnected
     */
    disconnect() {
        var _a;
        if ((_a = this._serial) === null || _a === void 0 ? void 0 : _a.isSerialConnected()) {
            this._serial.disconnectSerial();
            return 'Disconnected';
        }
        throw new Error('Board already disconnected');
    }
    /**
     * Reset the board (disconnect)
     */
    reset() {
        try {
            this.disconnect();
        }
        catch (err) {
            //silent
        }
    }
    /**
     * Compile and upload the sketch + connect (if autoconnect)
     * @param sketchPath
     * @param autoconnect
     * @returns {Promise<string>} info or errors for compilation/upload
     */
    compileAndUpload(sketchPath, autoconnect) {
        return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if ((_a = this._serial) === null || _a === void 0 ? void 0 : _a.isSerialConnected())
                this._serial.disconnectSerial();
            try {
                const result = yield arduino_cli_1.ArduinoCli.getInstance().compileAndUpload(sketchPath);
                // reconnect
                if (autoconnect) {
                    yield this.connect();
                }
                res(result);
            }
            catch (err) {
                rej(err);
            }
        }));
    }
}
exports.Arduino = Arduino;
//# sourceMappingURL=arduino.js.map