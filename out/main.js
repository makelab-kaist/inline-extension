"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const ui = require("./ui");
const extension_1 = require("./extension");
const virtual_arduino_1 = require("./virtual-arduino");
const annotations_1 = require("./annotations");
const sidebarViewProvider_1 = require("./sidebarViewProvider");
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
    // Side View
    const sideview = new sidebarViewProvider_1.SideViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(sidebarViewProvider_1.SideViewProvider.viewType, sideview));
    (0, extension_1.registerSideView)(sideview);
    // First time config
    context.subscriptions.push(vscode.commands.registerCommand('double-cheese.configureConnection', extension_1.configureConnection));
    // Connect to the serial port
    context.subscriptions.push(vscode.commands.registerCommand('double-cheese.connect', extension_1.connectSerial));
    // Disconnect from serial port
    context.subscriptions.push(vscode.commands.registerCommand('double-cheese.disconnect', extension_1.disconnectSerial));
    context.subscriptions.push(vscode.commands.registerCommand('double-cheese.compileUpload', extension_1.compileAndUpload));
    context.subscriptions.push(vscode.commands.registerCommand('double-cheese.clearAnnotations', extension_1.removeAnnotationsFromCode));
    context.subscriptions.push(vscode.commands.registerCommand('double-cheese.hello', extension_1.hello));
}
exports.activate = activate;
/**
 * @param {vscode.TextDocumentChangeEvent} event
 */
vscode.workspace.onDidChangeTextDocument(annotations_1.removeAllAnnotations);
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