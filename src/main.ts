/**
 * Entry point of the extension
 */
import * as vscode from 'vscode';

import {
  configureConnection,
  connectSerial,
  disconnectSerial,
  compileAndUpload,
  compileAndUploadRelease,
  registerSideView,
  startConnectionToServer,
  changeServer,
  isCodeValid,
  configureBoard,
  removeAnnotationsFromCode,
  toggleHighlight,
} from './extension';
import { SideViewProvider } from './ui/sidebarViewProvider';
import { createAnnotations, clearAnnotations } from './annotations';

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
  // register it so we can speak to it
  registerSideView(sideview);

  // First time config
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'inline.configureConnection',
      configureConnection
    )
  );

  // Choose a board
  context.subscriptions.push(
    vscode.commands.registerCommand('inline.configureBoard', configureBoard)
  );

  // Connect to the serial port
  context.subscriptions.push(
    vscode.commands.registerCommand('inline.connect', connectSerial)
  );

  // Disconnect from serial port
  context.subscriptions.push(
    vscode.commands.registerCommand('inline.disconnect', disconnectSerial)
  );

  // Pick a different server
  context.subscriptions.push(
    vscode.commands.registerCommand('inline.changeServer', changeServer)
  );

  // Compile and Upload the Arduino sketch with instrumented code
  context.subscriptions.push(
    vscode.commands.registerCommand('inline.compileUpload', compileAndUpload)
  );

  // Compile and Upload the Arduino sketch with clean code
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'inline.compileUploadRelease',
      compileAndUploadRelease
    )
  );

  // Clear all annotations
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'inline.clearAnnotations',
      removeAnnotationsFromCode
    )
  );

  // Toggle highlight
  context.subscriptions.push(
    vscode.commands.registerCommand('inline.toggleHighlight', toggleHighlight)
  );
}

// If code is modified we need to check if it is still valid
vscode.workspace.onDidChangeTextDocument((e) => {
  isCodeValid();
  const fileChanged = e.document.fileName;
  if (fileChanged.endsWith('.ino')) {
    // only stops for source code
    clearAnnotations();
  }
});

vscode.window.onDidChangeActiveTextEditor(() => {
  // console.log('editor changed');
});

vscode.workspace.onDidCloseTextDocument(() => {
  // console.log('text close');
});

vscode.workspace.onDidSaveTextDocument(createAnnotations);

// this method is called when your extension is deactivated
export function deactivate() {}
