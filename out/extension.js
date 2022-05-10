"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hello = exports.decorateEditor = exports.compileAndUpload = exports.disconnectSerial = exports.connectSerial = exports.configureConnection = void 0;
const ui = require("./ui");
const virtual_arduino_1 = require("./virtual-arduino");
const codeManager_1 = require("./codeManager");
const annotations_1 = require("./annotations");
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
    const ans = await ui.confirmationMessage('Connect to serial?', ['Yes', 'No']);
    const autoConnect = ans === 'Yes';
    virtual_arduino_1.VirtualArduino.getInstance()
        .beginSerial({ portName, baud, autoConnect }, onSerialData)
        .then((msg) => ui.vsInfo(msg))
        .catch((msg) => ui.vsError(msg));
}
exports.configureConnection = configureConnection;
function onSerialData(ack) {
    if (!ack.success)
        return;
    const data = ack.message;
    // console.log(data);
    // should start with $
    if (data.charAt(0) !== '$')
        return;
    const [id, line, value] = data.slice(1).split(','); // e.g., $b4999c,9,1
    console.log(id, line, value);
    // createAnnotation(id, +line);
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
function decorateEditor() {
    try {
        // remove all annotations if they exist
        // removeAllAnnotations();
        // Get all the lines with the '//?' queries
        const queries = codeManager_1.CodeManager.getInstance().getFilteredLines('query');
        queries.forEach(({ id, line }) => {
            // createAnnotation(id, line);
            (0, annotations_1.addAndShowAnnotation)(id, line, 'NaN', {
                color: 'green',
                backgroundColor: 'none',
                highlightColor: 'yellow',
            });
        });
        // console.log(JSON.stringify(queries, null, ' '));
    }
    catch (err) {
        ui.vsError(err.message);
        return;
    }
}
exports.decorateEditor = decorateEditor;
function hello() {
    // createAnnotation('1231', 1);
    // addAndShowAnnotation('1231', 1, 'hello');
    // let i = 0;
    // setInterval(() => {
    //   updateAnnotation('1231', `${i++}`);
    // }, 5000);
}
exports.hello = hello;
//# sourceMappingURL=extension.js.map