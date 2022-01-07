"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectSerial = exports.connectSerial = exports.configureConnection = void 0;
const ui = require("./ui");
const virtual_arduino_1 = require("./virtual-arduino");
async function configureConnection() {
    const ports = await virtual_arduino_1.VirtualArduino.getInstance().getAvailablePorts();
    const selectPort = async () => {
        return await ui.showQuickPick(ports, 'Pick your serial port');
    };
    const selectBaud = async () => {
        const lsbaud = virtual_arduino_1.VirtualArduino.getInstance().getAvailableBuadRate();
        const pick = await ui.showQuickPick(lsbaud, 'Pick your buad rate');
        if (!pick)
            return;
        return parseInt(pick);
    };
    const port = await selectPort();
    if (!port)
        return;
    const baud = await selectBaud();
    if (!baud)
        return;
    virtual_arduino_1.VirtualArduino.getInstance()
        .beginSerial(port, baud, onSerialData)
        .then((msg) => ui.vsInfo(msg))
        .catch((msg) => ui.vsError(msg));
}
exports.configureConnection = configureConnection;
function onSerialData(data) {
    console.log('Data received: ' + data);
    // AnnotationManager.getInstance().displayAnnotations(data);
}
function connectSerial() {
    virtual_arduino_1.VirtualArduino.getInstance()
        .connectSerial()
        .then((msg) => ui.vsInfo(msg))
        .catch((msg) => ui.vsError(msg));
}
exports.connectSerial = connectSerial;
function disconnectSerial() {
    virtual_arduino_1.VirtualArduino.getInstance()
        .disconnectSerial()
        .then((msg) => ui.vsInfo(msg))
        .catch((msg) => ui.vsError(msg));
}
exports.disconnectSerial = disconnectSerial;
//# sourceMappingURL=extension.js.map