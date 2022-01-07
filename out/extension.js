"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileAndUpload = exports.disconnectSerial = exports.connectSerial = exports.configureConnection = exports.initializeProject = void 0;
const vscode = require("vscode");
const ui = require("./ui");
const extension = require("./extension-support");
const fs_1 = require("fs");
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
    // const newCode = CodeManager.getInstance().parseAndGenerateCode();
    // saveFile(newCode);
    // console.log(newCode);
    // AnnotationManager.getInstance().updateAnnotations();
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
//# sourceMappingURL=extension.js.map