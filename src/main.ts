import * as vscode from 'vscode';

import * as ui from './ui';
import {
  configureConnection,
  connectSerial,
  disconnectSerial,
  compileAndUpload,
  compileAndUploadRelease,
  decorateEditor,
  registerSideView,
  removeAnnotationsFromCode,
  toggleHighlight,
  onInput,
} from './extension';
import { VirtualArduino } from './virtual-arduino';
import { removeAllAnnotations } from './annotations';
import { SideViewProvider } from './sidebarViewProvider';

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

  // Side View
  const sideview = new SideViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SideViewProvider.viewType,
      sideview
    )
  );
  registerSideView(sideview);

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
    vscode.commands.registerCommand(
      'double-cheese.compileUploadRelease',
      compileAndUploadRelease
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'double-cheese.clearAnnotations',
      removeAnnotationsFromCode
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'double-cheese.toggleHighlight',
      toggleHighlight
    )
  );
}

/**
 * @param {vscode.TextDocumentChangeEvent} event
 */
vscode.workspace.onDidChangeTextDocument(onInput);

vscode.window.onDidChangeActiveTextEditor(() => {
  console.log('editor change');
});

vscode.workspace.onDidCloseTextDocument(() => {
  console.log('text close');
});

vscode.workspace.onDidSaveTextDocument(decorateEditor);

// this method is called when your extension is deactivated
export function deactivate() {}
