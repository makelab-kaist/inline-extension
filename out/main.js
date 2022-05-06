"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const ui = require("./ui");
const extension_1 = require("./extension");
const virtual_arduino_1 = require("./virtual-arduino");
async function startConnectionToServer() {
    await virtual_arduino_1.VirtualArduino.getInstance()
        .connectToServer()
        .then((msg) => {
        ui.vsInfo(msg);
    })
        .catch((err) => {
        ui.vsError(err);
    });
}
async function activate(context) {
    // Connect to server before we start
    await startConnectionToServer();
    // First time config
    context.subscriptions.push(vscode.commands.registerCommand('double-cheese.configureConnection', extension_1.configureConnection));
    // Connect to the serial port
    context.subscriptions.push(vscode.commands.registerCommand('double-cheese.connect', extension_1.connectSerial));
    // Disconnect from serial port
    context.subscriptions.push(vscode.commands.registerCommand('double-cheese.disconnect', extension_1.disconnectSerial));
    context.subscriptions.push(vscode.commands.registerCommand('double-cheese.compileUpload', extension_1.compileAndUpload));
    context.subscriptions.push(vscode.commands.registerCommand('double-cheese.hello', extension_1.hello));
}
exports.activate = activate;
/**
 * @param {vscode.TextDocumentChangeEvent} event
 */
vscode.workspace.onDidChangeTextDocument((event) => {
    // console.log('text change ' + event.document.fileName);
    // AnnotationManager.getInstance().updateAnnotations();
});
vscode.window.onDidChangeActiveTextEditor(() => {
    console.log('editor change');
});
vscode.workspace.onDidCloseTextDocument(() => {
    console.log('text close');
});
vscode.workspace.onDidSaveTextDocument(extension_1.decorateEditor);
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=main.js.map