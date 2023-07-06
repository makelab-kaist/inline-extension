/**
 * Major expression functionalities exposed to main
 */

import * as vscode from 'vscode';
import * as ui from './ui/vscode-ui';
import { VirtualArduino } from './arduino-utils/virtual-arduino';
import { CodeManager } from './codeManager';
import { SideViewProvider } from './ui/sidebarViewProvider';
import { Subject } from 'rxjs';
import { clearAnnotations, toggleAnnotationsHighlight } from './annotations';
const { name, publisher } = require('../package.json');

export type LiveData = {
  id: string;
  line: number;
  values: string[];
};

// The data broadcaster
export const data$ = new Subject<LiveData>();

// The side view
let sideView: SideViewProvider;
let highlight: boolean = true;

// Register side view so we can speak to it
function registerSideView(_sideView: SideViewProvider) {
  if (_sideView) sideView = _sideView;
}

// Handle data that comes from the Arduino
function onSerialData(data: string) {
  if (data.charAt(0) !== '$') return; // Data from Arduino should starts with '$'
  const [id, line, ...values] = data.slice(1).split(','); // e.g., $b4999c,9,1
  data$.next({ id, line: +line, values }); // broadcast to subscribers with rxjs
}

// Get extension, path and URI
function getExtension(): vscode.Extension<any> {
  return vscode.extensions.getExtension(`${publisher}.${name}`)!; // I know I exist
}

function getExtensionPath(): string {
  return getExtension()?.extensionPath;
}

function getExtensionUri(...pathSegments: string[]): vscode.Uri {
  const uri = vscode.Uri.file(getExtensionPath());
  return vscode.Uri.joinPath(uri, ...pathSegments);
}

// Configure step-by-step the connection to the Virtual Arduino
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

  const portName = await selectPort();
  if (!portName) return;

  const baud = await selectBaud();
  if (!baud) return;

  // Autoconnect?
  const ans = await ui.confirmationMessage('Connect to serial?', ['Yes', 'No']);
  const autoConnect = ans === 'Yes';

  VirtualArduino.getInstance()
    .beginSerial({ portName, baud, autoConnect }, onSerialData)
    .then((msg) => {
      ui.vsInfo(msg);
      sideView?.sendMessage({ message: 'configureConnection', portName });
      if (autoConnect) sideView?.sendMessage({ message: 'connected' });
    })
    .catch((msg) => ui.vsError(msg));
}

// Configure board
async function configureBoard() {
  const boards = await VirtualArduino.getInstance().getAvailableBoards();
  const pick = await ui.showQuickPick(boards, 'Pick your buad rate');
  if (!pick) return;
  VirtualArduino.getInstance().selectBoard(pick);
}

// Connect to the server
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

// Change the server
async function changeServer() {
  let ip = await ui.showInputBox('', 'http://localhost', () => false);
  if (!ip) return;
  if (!ip.startsWith('http://')) {
    ip = 'http://' + ip;
  }
  VirtualArduino.changeServerIp(ip);
}

// Connect to the serial
function connectSerial() {
  VirtualArduino.getInstance()
    .connectSerial()
    .then((msg) => {
      ui.vsInfo(msg);
      sideView?.sendMessage({ message: 'connected' });
    })
    .catch((msg) => ui.vsError(msg));
}

// Disconnect from serial
function disconnectSerial() {
  VirtualArduino.getInstance()
    .disconnectSerial()
    .then((msg) => {
      ui.vsInfo(msg);
      sideView?.sendMessage({ message: 'disconnected' });
    })
    .catch((msg) => ui.vsError(msg));
}

// Compile and upload instrumeted code to Arduino
function compileAndUpload() {
  try {
    // Get all lines with valid code
    const code = CodeManager.getInstance().generateInstrumentedCode();

    // Compile and upload
    VirtualArduino.getInstance()
      .compileAndUpload(code)
      .then(([message, link]: string[]) => {
        ui.vsInfoWithLink(message, link);
        CodeManager.getInstance().updateCodeHash();
        sideView?.sendMessage({ message: 'codeDirty', value: false });
      })
      .catch((msg) => ui.vsError(msg));
  } catch (err: any) {
    ui.vsError(err.message);
    return;
  }
}

// Compile and upload pure code to Arduino
function compileAndUploadRelease() {
  try {
    const code = CodeManager.getInstance().getCurrentCode();

    // Compile and upload
    VirtualArduino.getInstance()
      .compileAndUpload(code)
      .then(([message, link]: string[]) => {
        ui.vsInfo(message);
      })
      .catch((msg) => ui.vsError(msg));
  } catch (err: any) {
    ui.vsError(err.message);
    return;
  }
}

// Check whether the code has been changed after an upload (valid code)
function isCodeValid() {
  // check if the code was modified after upload
  sideView?.sendMessage({
    message: 'codeDirty',
    value: CodeManager.getInstance().isCodeDirty(),
  });
}

// Clear the annotations and remove all the // [expression] ? markings
function removeAnnotationsFromCode() {
  // Clear
  clearAnnotations();

  // swap code
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    ui.vsError('Not a valid file');
    return;
  }
  const newCode = CodeManager.getInstance().disableAnnotations();

  // replace old code with new one
  const doc = editor.document;
  const lines = doc.lineCount;
  const lastCol = doc.lineAt(lines - 1).range.end.character;

  editor.edit((editBuilder) => {
    const start = new vscode.Position(0, 0);
    const end = new vscode.Position(doc.lineCount, lastCol);
    const range = new vscode.Range(start, end);
    editBuilder.replace(range, newCode);
    ui.vsInfo('All annotations //? removed');
  });
}

// Wrapper for toggle highlight
function toggleHighlight() {
  const hl = toggleAnnotationsHighlight();
  sideView.sendMessage({ message: 'toggleHighlight', hl });
}

export {
  changeServer,
  compileAndUpload,
  compileAndUploadRelease,
  configureConnection,
  configureBoard,
  connectSerial,
  disconnectSerial,
  getExtension,
  getExtensionPath,
  getExtensionUri,
  isCodeValid,
  registerSideView,
  startConnectionToServer,
  removeAnnotationsFromCode,
  toggleHighlight,
};
