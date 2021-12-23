"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const extension_1 = require("./extension");
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('double-cheese.initProject', extension_1.initProject));
    context.subscriptions.push(vscode.commands.registerCommand('double-cheese.openConnection', extension_1.configureAndConnect));
    context.subscriptions.push(vscode.commands.registerCommand('double-cheese.compileUpload', extension_1.compileAndUpload));
    context.subscriptions.push(vscode.commands.registerCommand('double-cheese.closeConnection', extension_1.closeConnection));
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