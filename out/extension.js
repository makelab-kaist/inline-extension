"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hello = exports.registerSideView = exports.removeAnnotationsFromCode = exports.decorateEditor = exports.compileAndUpload = exports.disconnectSerial = exports.connectSerial = exports.configureConnection = void 0;
const vscode = require("vscode");
const ui = require("./ui");
const virtual_arduino_1 = require("./virtual-arduino");
const codeManager_1 = require("./codeManager");
const annotations_1 = require("./annotations");
let sideView;
function registerSideView(_sideView) {
    if (_sideView)
        sideView = _sideView;
}
exports.registerSideView = registerSideView;
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
        .then((msg) => {
        ui.vsInfo(msg);
        sideView?.sendMessage({ message: 'configureConnection', portName });
        if (autoConnect)
            sideView?.sendMessage({ message: 'connected' });
    })
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
    const [id, line, ...values] = data.slice(1).split(','); // e.g., $b4999c,9,1
    // console.log(id, line, values);
    (0, annotations_1.updateAnnotation)(id, +line, {
        contentText: values.toString(),
        color: 'green',
    });
}
function connectSerial() {
    virtual_arduino_1.VirtualArduino.getInstance()
        .connectSerial()
        .then((msg) => {
        ui.vsInfo(msg);
        sideView?.sendMessage({ message: 'connected' });
    })
        .catch((msg) => ui.vsError(msg));
}
exports.connectSerial = connectSerial;
function disconnectSerial() {
    virtual_arduino_1.VirtualArduino.getInstance()
        .disconnectSerial()
        .then((msg) => {
        ui.vsInfo(msg);
        sideView?.sendMessage({ message: 'disconnected' });
    })
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
        (0, annotations_1.removeAllAnnotations)();
        // Get all the lines with the '//?' queries
        const queries = codeManager_1.CodeManager.getInstance().getFilteredLines('query');
        queries.forEach(({ id, line }) => {
            (0, annotations_1.addAnnotation)(id, line, {
                contentText: 'NaN',
                color: 'grey',
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
function removeAnnotationsFromCode() {
    (0, annotations_1.removeAllAnnotations)();
    // swap code
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        ui.vsError('Not a valid file');
        return;
    }
    const newCode = codeManager_1.CodeManager.getInstance().removeQueriesFromCode();
    // replace old code with new one
    const doc = editor.document;
    const lines = doc.lineCount;
    const lastCol = doc.lineAt(lines - 1).range.end.character;
    editor.edit((editBuilder) => {
        const start = new vscode.Position(0, 0);
        const end = new vscode.Position(doc.lineCount, lastCol);
        const range = new vscode.Range(start, end);
        editBuilder.replace(range, newCode);
        ui.vsInfo('All annotations //? removed');
    });
}
exports.removeAnnotationsFromCode = removeAnnotationsFromCode;
function hello() {
    // sideView?.sendMessage('hi');
}
exports.hello = hello;
//# sourceMappingURL=extension.js.map