import * as vscode from 'vscode';
import * as ui from './ui';

import * as extension from './extension-support';
import { writeFileSync } from 'fs';
import { VirtualArduino } from './virtual-arduino';
import { getParsedData } from './parser';

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

async function initializeProject() {
  const workspace = await extension.getCurrentWorkspace();
  const workspaceName = workspace.name;

  // Copy folder with code library
  await extension.copyFileOrFolder(
    extension.templatesFolderUri(), // src folder
    'dependencies',
    workspace.uri,
    extension.buildFolderName()
  );

  // Copy over the current sketch?
  const ans = await ui.confirmationMessage(
    'Are you sure you want to override your sketch?',
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
}

async function compileAndUpload() {
  const sketch = await extension.buildFolderUri();

  // const newCode = CodeManager.getInstance().parseAndGenerateCode();
  // saveFile(newCode);
  // AnnotationManager.getInstance().updateAnnotations();

  // Compile and upload if pass
  VirtualArduino.getInstance()
    .compileAndUpload(sketch.fsPath)
    .then((msg) => ui.vsInfo(msg))
    .catch((msg) => ui.vsError(msg));
}

async function saveFileInBuild(code: string) {
  const build = await extension.buildFolderUri();
  const out = vscode.Uri.joinPath(build, extension.buildFolderName() + '.ino');
  if (!out) return;
  writeFileSync(out.fsPath, code, {});
}

function helloWorld() {
  const test = `void setup()
  {
    Serial.begin(115200);
    int a = digitalRead(2);
    Serial.println("Hello world"); //?
  }
  
  void loop()
  {
    int a = digitalRead(2);
  }`;
  const result = getParsedData(test);
  console.log(result);
}

export {
  initializeProject,
  configureConnection,
  connectSerial,
  disconnectSerial,
  compileAndUpload,
  helloWorld,
};
