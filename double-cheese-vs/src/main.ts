import * as vscode from 'vscode';
import { ArduinoCli, ArduinoBoard } from './arduino-cli';
import { VirtualArduino } from './virtual-arduino';
import * as ui from './ui';
import {
  initializeProject,
  configureConnection,
  connectSerial,
  disconnectSerial,
} from './extension';

export function activate(context: vscode.ExtensionContext) {
  // Connect to server
  try {
    VirtualArduino.getInstance().connectToServer();
  } catch (err) {
    ui.vsError((err as Error).message);
  }

  // Registering commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'double-cheese.initProject',
      initializeProject
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'double-cheese.configureConnection',
      configureConnection
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'double-cheese.openConnection',
      connectSerial
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'double-cheese.closeConnection',
      disconnectSerial
    )
  );

  // context.subscriptions.push(
  //   vscode.commands.registerCommand(
  //     'double-cheese.compileUpload',
  //     compileAndUpload
  //   )
  // );
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
