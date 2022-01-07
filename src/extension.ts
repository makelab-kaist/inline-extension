import * as vscode from 'vscode';
import { io, Socket } from 'socket.io-client';
import * as ui from './ui';

import * as extension from './extension-support';
import { writeFile, writeFileSync } from 'fs';
import { TextLocation } from './parser';
import { VirtualArduino } from './virtual-arduino';

async function configureConnection() {
  const ports = await VirtualArduino.getInstance().getAvailablePorts();

  const selectPort = async () => {
    return await ui.showQuickPick(ports, 'Pick your serial port');
  };

  const selectBaud = async () => {
    const lsbaud = VirtualArduino.getInstance().getAvailableBuadRate();
    const pick = await ui.showQuickPick(lsbaud, 'Pick your buad rate');
    if (!pick) return;
    return parseInt(pick);
  };

  const port = await selectPort();
  if (!port) return;

  const baud = await selectBaud();
  if (!baud) return;

  VirtualArduino.getInstance()
    .beginSerial(port, baud, onSerialData)
    .then((msg) => ui.vsInfo(msg))
    .catch((msg) => ui.vsError(msg));
}

function onSerialData(data: string) {
  console.log('Data received: ' + data);
  // AnnotationManager.getInstance().displayAnnotations(data);
}

function connectSerial() {
  VirtualArduino.getInstance()
    .connectSerial()
    .then((msg) => ui.vsInfo(msg))
    .catch((msg) => ui.vsError(msg));
}

function disconnectSerial() {
  VirtualArduino.getInstance()
    .disconnectSerial()
    .then((msg) => ui.vsInfo(msg))
    .catch((msg) => ui.vsError(msg));
}

/*
async function initializeProject() {
  const workspace = await extension.getCurrentWorkspace();
  const workspaceName = workspace.name;

  // Wanna continue?
  const ans = await ui.confirmationMessage(
    'Are you sure you want to override your project?',
    ['Yes', 'No']
  );
  if (ans === 'No' || ans === undefined) return; // bye bye

  // Copy ino file template
  await extension.copyFileOrFolder(
    extension.templatesFolderUri(), // src folder
    'sketch.ino', // src file
    workspace.uri, // target folder
    workspaceName + '.ino' // target file
  );

  // Copy folder with code library
  await extension.copyFileOrFolder(
    extension.templatesFolderUri(), // src folder
    'dependencies',
    workspace.uri,
    extension.buildFolderName()
  );
}

async function compileAndUpload() {
  const sketch = await extension.buildFolderUri();

  const newCode = CodeManager.getInstance().parseAndGenerateCode();
  saveFile(newCode);
  // console.log(newCode);

  AnnotationManager.getInstance().updateAnnotations();

  // Compile and upload if pass
  try {
    await ArduinoCli.getInstance().compileSketch(sketch);
    await ArduinoCli.getInstance().uploadSketch(sketch);
    ui.vsInfo('Sketch succssfully uploaded');
  } catch (e) {
    if (e instanceof Error) {
      ui.vsError(e.message);
    } else {
      ui.vsError('Compilation / uploading error');
      console.log(e);
    }
  }
}

async function saveFile(code: string) {
  // const wsedit = new vscode.WorkspaceEdit();
  const build = await extension.buildFolderUri();
  const out = vscode.Uri.joinPath(build, extension.buildFolderName() + '.ino');
  if (!out) return;
  writeFileSync(out.fsPath, code, {});
}

function hello() {
  // const location: Partial<TextLocation> = {};
  // location.line = 8;
  // location.startCol = 42;
  // location.endCol = 45;
}
*/

export {
  // initializeProject,
  configureConnection,
  connectSerial,
  disconnectSerial,
  // compileAndUpload,
  // hello,
};
