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
    constructor() { }
    listAvailablePorts(boardInfo = {}) {
        return new Promise((resolve, reject) => {
            // Get all the ports
            serialport_1.default.list().then((ports) => {
                // Filter the ports
                const { productId: pid, vendorId: vid } = boardInfo;
                let filteredPorts = ports
                    .filter(({ vendorId }) => {
                    if (vendorId && vid)
                        return vid == parseInt(vendorId, 16); // hex
                    // else
                    return true;
                })
                    .filter(({ productId }) => {
                    if (productId && pid)
                        return pid == parseInt(productId, 16); // hex
                    // else
                    return true;
                });
                // Extract the port names
                const paths = filteredPorts.map(({ path }) => path);
                if (paths.length > 0)
                    resolve(paths);
                else
                    reject(new Error('No serial found'));
            });
        });
    }
    isConnected() {
        var _a;
        return ((_a = this.serialPort) === null || _a === void 0 ? void 0 : _a.isOpen) || false;
    }
    connect(portName, baud = 115200, delayAtStart = 100) {
        return new Promise((resolve, reject) => {
            // Already connected?
            if (this.isConnected()) {
                reject('Serial port already open');
            }
            this.serialPort = new serialport_1.default(portName, {
                baudRate: baud,
            }); // this might throw an error
            this.serialPort.on('open', () => {
                setTimeout(() => {
                    resolve();
                }, delayAtStart); // let's give it some time to wake up
            });
        });
    }
    onReadData(callback) {
        if (!this.isConnected())
            return;
        this.parser = this.serialPort.pipe(new serialport_1.parsers.Readline({ delimiter: '\r\n' }));
        // Switches the port into "flowing mode"
        this.parser.on('data', function (data) {
            callback(data);
        });
    }
    stopListening() {
        var _a;
        if (!this.isConnected())
            return;
        (_a = this.parser) === null || _a === void 0 ? void 0 : _a.removeAllListeners();
    }
    disconnect() {
        var _a;
        if (!this.isConnected()) {
            throw new Error('Serial port not connected');
        }
        (_a = this.serialPort) === null || _a === void 0 ? void 0 : _a.close();
    }
    send(commandString) {
        var _a;
        (_a = this.serialPort) === null || _a === void 0 ? void 0 : _a.write(`${commandString}\n\r`);
    }
}
exports.SimpleSerial = SimpleSerial;
//# sourceMappingURL=serial.js.map