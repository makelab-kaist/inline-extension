import * as vscode from 'vscode';

import * as ui from './ui';
import {
  configureConnection,
  connectSerial,
  disconnectSerial,
  compileAndUpload,
  decorateEditor,
  hello,
} from './extension';
import { VirtualArduino } from './virtual-arduino';

async function startConnectionToServer() {
  await VirtualArduino.getInstance()
    .connectToServer()
    .then((msg: string) => {
      ui.vsInfo(msg);
    })
    .catch((err) => {
      ui.vsError(err);
    });
}

export async function activate(context: vscode.ExtensionContext) {
  // Connect to server before we start
  await startConnectionToServer();

  // First time config
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'double-cheese.configureConnection',
      configureConnection
    )
  );

  // Connect to the serial port
  context.subscriptions.push(
    vscode.commands.registerCommand('double-cheese.connect', connectSerial)
  );

  // Disconnect from serial port
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'double-cheese.disconnect',
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
    vscode.commands.registerCommand('double-cheese.hello', hello)
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

vscode.workspace.onDidSaveTextDocument(decorateEditor);

// this method is called when your extension is deactivated
export function deactivate() {}
