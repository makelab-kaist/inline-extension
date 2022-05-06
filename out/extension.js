"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileAndUpload = exports.disconnectSerial = exports.connectSerial = exports.configureConnection = void 0;
const ui = require("./ui");
const virtual_arduino_1 = require("./virtual-arduino");
const codeManager_1 = require("./codeManager");
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
    const portName = await selectPort();
    if (!portName)
        return;
    const baud = await selectBaud();
    if (!baud)
        return;
    // Autoconnect?
    const ans = await ui.confirmationMessage('Connect to server', ['Yes', 'No']);
    const autoConnect = ans === 'Yes';
    virtual_arduino_1.VirtualArduino.getInstance()
        .beginSerial({ portName, baud, autoConnect }, onSerialData)
        .then((msg) => ui.vsInfo(msg))
        .catch((msg) => ui.vsError(msg));
}
exports.configureConnection = configureConnection;
function onSerialData(data) {
    if (data.success)
        console.log('Data received: ' + data.message);
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
function compileAndUpload() {
    try {
        // const code = CodeManager.getInstance().getCurrentCode();
        // Get all lines with valid code
        const lines = codeManager_1.CodeManager.getInstance().getFilteredLines('function');
        const code = codeManager_1.CodeManager.getInstance().generateCode(lines);
        // Compile and upload
        virtual_arduino_1.VirtualArduino.getInstance()
            .compileAndUpload(code)
            .then(([message, link]) => {
            ui.vsInfoWithLink(message, link);
        })
            .catch((msg) => ui.vsError(msg));
    }
    catch (err) {
        ui.vsError(err.message);
        return;
    }
}
exports.compileAndUpload = compileAndUpload;
//# sourceMappingURL=extension.js.map