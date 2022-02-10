import * as vscode from 'vscode';

import * as ui from './ui';
import {
  initializeProject,
  configureConnection,
  connectSerial,
  disconnectSerial,
  compileAndUpload,
  helloWorld,
  updateLineInformation,
} from './extension';
import { VirtualArduino } from './virtual-arduino';
import { utimes } from 'fs';

function beforeAll() {
  VirtualArduino.getInstance()
    .connectToServer()
    .then((msg: string) => {
      ui.vsInfo(msg);
    })
    .catch((err) => {
      ui.vsError(err);
    });
}

export function activate(context: vscode.ExtensionContext) {
  // Connect to server before we start
  beforeAll();

  // Initialize the folder of the project
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'double-cheese.initProject',
      initializeProject
    )
  );

  // First time config
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'double-cheese.configureConnection',
      configureConnection
    )
  );

  // Connect to the serial port
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'double-cheese.openConnection',
      connectSerial
    )
  );

  // Disconnect from serial port
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'double-cheese.closeConnection',
      disconnectSerial
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'double-cheese.compileUpload',
      compileAndUpload
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('double-cheese.hello', helloWorld)
  );
}

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

vscode.workspace.onDidSaveTextDocument(updateLineInformation);

// this method is called when your extension is deactivated
export function deactivate() {}
