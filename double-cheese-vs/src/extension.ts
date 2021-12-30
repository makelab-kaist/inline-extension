import * as vscode from 'vscode';
import { io, Socket } from 'socket.io-client';
import * as ui from './ui';
import { ArduinoCli, ArduinoBoard, ArduinoPlatform } from './arduino-cli';
import { VirtualArduino } from './virtual-arduino';
import { CodeManager } from './codeManager';
import * as extension from './extension_support';
import { writeFile, writeFileSync } from 'fs';

async function configureConnection() {
  // Configure arduino-cli board
  const selectBoard = async () => {
    const list = Object.keys(ArduinoBoard);
    const pick = await ui.showQuickPick(list, 'Choose your board');
    if (!pick) return; // cancel
    const fqbn: ArduinoBoard = ArduinoBoard[pick as keyof typeof ArduinoBoard];
    return fqbn;
  };

  const selectBaud = async () => {
    const lsbaud = VirtualArduino.getInstance().getAvailableBuadRate();
    const pick = await ui.showQuickPick(lsbaud, 'Pick your buad rate');
    if (!pick) return;
    return parseInt(pick);
  };

  const selectPort = async () => {
    const ports = await ArduinoCli.getInstance().listAvailablePorts();
    return await ui.showQuickPick(ports, 'Pick your serial port');
  };

  const fqbn = await selectBoard();
  if (!fqbn) return;

  const baud = await selectBaud();
  if (!baud) return;

  const port = await selectPort();
  if (!port) return;

  try {
    ArduinoCli.getInstance().init(fqbn, port);
    VirtualArduino.getInstance().configure(baud, port, onSerialData);
    ui.vsInfo('Configuration saved');
  } catch (e) {
    ui.vsError((e as Error).message);
  }
}

function onSerialData(data: string) {
  console.log('Data received: ' + data);
}

function connectSerial() {
  try {
    VirtualArduino.getInstance().connectSerial();
    ui.vsInfo('Connection open');
  } catch (e) {
    ui.vsError((e as Error).message);
  }
}

function disconnectSerial() {
  try {
    VirtualArduino.getInstance().disconnectSerial();
    ui.vsInfo('Connection closed');
  } catch (e) {
    ui.vsError((e as Error).message);
  }
}

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
  console.log(newCode);

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

export {
  initializeProject,
  configureConnection,
  connectSerial,
  disconnectSerial,
  compileAndUpload,
};
