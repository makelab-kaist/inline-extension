"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const virtual_arduino_1 = require("./virtual-arduino");
const ui = require("./ui");
const extension_1 = require("./extension");
function beforeAll() {
    virtual_arduino_1.VirtualArduino.getInstance()
        .connectToServer()
        .catch((err) => {
        ui.vsError(err);
    });
}
function activate(context) {
    // Connect to server before we start
    beforeAll();
    // Initialize the folder of the project
    context.subscriptions.push(vscode.commands.registerCommand('double-cheese.initProject', extension_1.initializeProject));
    // First time config
    context.subscriptions.push(vscode.commands.registerCommand('double-cheese.configureConnection', extension_1.configureConnection));
    // Connect to the serial port
    context.subscriptions.push(vscode.commands.registerCommand('double-cheese.openConnection', extension_1.connectSerial));
    // Disconnect from serial port
    context.subscriptions.push(vscode.commands.registerCommand('double-cheese.closeConnection', extension_1.disconnectSerial));
    // context.subscriptions.push(
    //   vscode.commands.registerCommand(
    //     'double-cheese.compileUpload',
    //     compileAndUpload
    //   )
    // );
}
exports.activate = activate;
/**
 * @param {vscode.TextDocumentChangeEvent} event
 */
vscode.workspace.onDidChangeTextDocument((event) => {
    console.log('text change ' + event.document.fileName);
});
vscode.window.onDidChangeActiveTextEditor(() => {
    console.log('editor change');
});
vscode.workspace.onDidCloseTextDocument(() => {
    console.log('text close');
});
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=main.js.map