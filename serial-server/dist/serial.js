"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleSerial = void 0;
const serialport_1 = __importStar(require("serialport"));
class SimpleSerial {
    constructor(portName, baud = 115200, onIncomingData, delayAtStart = 50) {
        this.portName = portName;
        this.baud = baud;
        this.onIncomingData = onIncomingData;
        this.delayAtStart = delayAtStart;
    }
    connectSerial() {
        return new Promise((resolve, reject) => {
            // Already connected?
            if (this.isSerialConnected()) {
                reject('Serial port already open');
            }
            try {
                this.serialPort = new serialport_1.default(this.portName, {
                    baudRate: this.baud,
                }, function (err) {
                    if (err) {
                        reject(err.message);
                    }
                });
                // After opening, register the callback
                this.serialPort.on('open', () => {
                    setTimeout(() => {
                        this.parser = this.serialPort.pipe(new serialport_1.parsers.Readline({ delimiter: '\r\n' }));
                        // Switches the port into "flowing mode"
                        this.parser.on('data', (data) => {
                            this.onIncomingData(data);
                        });
                        // Resolve
                        resolve(`Connected to ${this.portName}`);
                    }, this.delayAtStart); // let's give it some time to wake up
                });
            }
            catch (err) {
                reject(err.message);
            }
        });
    }
    disconnectSerial() {
        var _a, _b;
        if (!this.isSerialConnected()) {
            return;
        }
        // stop listenting
        (_a = this.parser) === null || _a === void 0 ? void 0 : _a.removeAllListeners();
        // close
        (_b = this.serialPort) === null || _b === void 0 ? void 0 : _b.close();
    }
    isSerialConnected() {
        var _a;
        return ((_a = this.serialPort) === null || _a === void 0 ? void 0 : _a.isOpen) || false;
    }
    send(commandString) {
        var _a;
        (_a = this.serialPort) === null || _a === void 0 ? void 0 : _a.write(`${commandString}\n\r`);
    }
}
exports.SimpleSerial = SimpleSerial;
//# sourceMappingURL=serial.js.map