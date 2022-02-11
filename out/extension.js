"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLineInformation = exports.helloWorld = exports.compileAndUpload = exports.disconnectSerial = exports.connectSerial = exports.configureConnection = exports.initializeProject = void 0;
const vscode = require("vscode");
const ui = require("./ui");
const extension = require("./extension-support");
const fs_1 = require("fs");
const virtual_arduino_1 = require("./virtual-arduino");
const codeManager_1 = require("./codeManager");
const decoration_1 = require("./decoration");
const timers_1 = require("timers");
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
    // console.log('Data received: ' + data);
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
async function initializeProject() {
    const workspace = await extension.getCurrentWorkspace();
    const workspaceName = workspace.name;
    // Copy folder with code library
    await extension.copyFileOrFolder(extension.templatesFolderUri(), // src folder
    'dependencies', workspace.uri, extension.buildFolderName());
    // Copy over the current sketch?
    const ans = await ui.confirmationMessage('Are you sure you want to override your sketch?', ['Yes', 'No']);
    if (ans === 'No' || ans === undefined)
        return; // bye bye
    // Copy ino file template
    await extension.copyFileOrFolder(extension.templatesFolderUri(), // src folder
    'sketch.ino', // src file
    workspace.uri, // target folder
    workspaceName + '.ino' // target file
    );
}
exports.initializeProject = initializeProject;
async function compileAndUpload() {
    const sketch = await extension.buildFolderUri();
    try {
        const code = codeManager_1.CodeManager.getInstance().getCurrentCode();
        // Get all lines with valid code
        const lines = codeManager_1.CodeManager.getInstance().getFilteredLines(code, 'function');
        const newCode = codeManager_1.CodeManager.getInstance().generateCode(code, lines);
        // Save the code
        saveFileInBuild(newCode);
    }
    catch (err) {
        ui.vsError(err.message);
        return;
    }
    // Compile and upload if pass
    virtual_arduino_1.VirtualArduino.getInstance()
        .compileAndUpload(sketch.fsPath)
        .then((msg) => ui.vsInfo(msg))
        .catch((msg) => ui.vsError(msg));
}
exports.compileAndUpload = compileAndUpload;
async function saveFileInBuild(code) {
    const build = await extension.buildFolderUri();
    const out = vscode.Uri.joinPath(build, extension.buildFolderName() + '.ino');
    if (!out)
        return;
    (0, fs_1.writeFileSync)(out.fsPath, code, {});
}
function updateLineInformation() {
    try {
        const code = codeManager_1.CodeManager.getInstance().getCurrentCode();
        // Get all the lines with the '//?' queries
        const queries = codeManager_1.CodeManager.getInstance().getFilteredLines(code, 'query');
        // DecorationManager.getInstance.updateQueryList(queries);
        console.log(JSON.stringify(queries, null, ' '));
    }
    catch (err) {
        ui.vsError(err.message);
        return;
    }
}
exports.updateLineInformation = updateLineInformation;
function helloWorld() {
    const ae = vscode.window.activeTextEditor;
    const q1 = new decoration_1.QueryDecoration(10, ae);
    const q2 = new decoration_1.QueryDecoration(12, ae);
    let i = 0;
    (0, timers_1.setInterval)(() => {
        q1.show('hello ' + i);
        i += 1;
    }, 5000);
    let j = 0;
    (0, timers_1.setInterval)(() => {
        q2.show('hello ' + j);
        j += 1;
    }, 1000);
    // CodeManager.getInstance().parseAndDecorate();
    // const test = `void setup()
    // {
    //   Serial.begin(115200);
    //   int a = digitalRead(2);
    //   Serial.println("Hello world"); //?
    // }
    // void loop()
    // {
    //   int a = digitalRead(2);
    // }`;
    // const result = getParsedData(test);
    // console.log(result);
}
exports.helloWorld = helloWorld;
//# sourceMappingURL=extension.js.map