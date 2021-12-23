// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ArduinoCli, ArduinoBoard } from './arduino-cli';
import { VirtualArduino } from './virtual-arduino';
import {
  closeConnection,
  compileAndUpload,
  configureAndConnect,
  initProject,
} from './extension';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('double-cheese.initProject', initProject)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'double-cheese.openConnection',
      configureAndConnect
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'double-cheese.compileUpload',
      compileAndUpload
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'double-cheese.closeConnection',
      closeConnection
    )
  );
}

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
export function deactivate() {}
