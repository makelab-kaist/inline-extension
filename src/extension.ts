import * as vscode from 'vscode';
import * as ui from './ui';
import { ArduinoAck, VirtualArduino } from './virtual-arduino';
import * as parser from './parser';
import { CodeManager } from './codeManager';
import {
  updateAnnotation,
  addAnnotation,
  removeAllAnnotations,
  removeHighlightLine,
} from './annotations';
import { SideViewProvider } from './sidebarViewProvider';

let sideView: SideViewProvider;
let highlight: boolean = true;
let codeHash: string = '';

function registerSideView(_sideView: SideViewProvider) {
  if (_sideView) sideView = _sideView;
}

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

function onSerialData(ack: ArduinoAck) {
  if (!ack.success) return;
  const data = ack.message as string;
  // console.log(data);

  // should start with $
  if (data.charAt(0) !== '$') return;
  const [id, line, ...values] = data.slice(1).split(','); // e.g., $b4999c,9,1

  updateAnnotation(id, +line, values, highlight);
}

function connectSerial() {
  VirtualArduino.getInstance()
    .connectSerial()
    .then((msg) => {
      ui.vsInfo(msg);
      sideView?.sendMessage({ message: 'connected' });
    })
    .catch((msg) => ui.vsError(msg));
}

function disconnectSerial() {
  VirtualArduino.getInstance()
    .disconnectSerial()
    .then((msg) => {
      ui.vsInfo(msg);
      sideView?.sendMessage({ message: 'disconnected' });
    })
    .catch((msg) => ui.vsError(msg));
}

function compileAndUpload() {
  try {
    // const code = CodeManager.getInstance().getCurrentCode();

    // Get all lines with valid code
    const lines: parser.LineData[] =
      CodeManager.getInstance().getFilteredLines('function');

    const code = CodeManager.getInstance().generateCode(lines);

    // Compile and upload
    VirtualArduino.getInstance()
      .compileAndUpload(code)
      .then(([message, link]: string[]) => {
        ui.vsInfoWithLink(message, link);
        updateCodeHash(); // new code hash
        sideView?.sendMessage({ message: 'codeDirty', value: false });
      })
      .catch((msg) => ui.vsError(msg));
  } catch (err: any) {
    ui.vsError(err.message);
    return;
  }
}

function onInput() {
  removeAllAnnotations();
  // check if the code was modified
  sideView?.sendMessage({ message: 'codeDirty', value: isCodeDirty() });
}

function decorateEditor() {
  try {
    // remove all annotations if they exist
    removeAllAnnotations();
    // Get all the lines with the '//?' queries
    const queries: parser.LineData[] =
      CodeManager.getInstance().getFilteredLines('query');

    queries.forEach(({ id, line, data }) => {
      const expression = data[0].expression;
      addAnnotation(id, line, 'NaN', expression, 'DodgerBlue');
    });
  } catch (err: any) {
    ui.vsError(err.message);
    return;
  }
}

function removeAnnotationsFromCode() {
  removeAllAnnotations();

  // swap code
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    ui.vsError('Not a valid file');
    return;
  }
  const newCode = CodeManager.getInstance().removeQueriesFromCode();

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

function toggleHighlight() {
  highlight = !highlight;
  if (!highlight) removeHighlightLine();
  sideView?.sendMessage({ message: 'toggleHighlight', highlight });
}

function isCodeDirty() {
  return codeHash !== CodeManager.getInstance().computeCodeHash();
}

function updateCodeHash() {
  codeHash = CodeManager.getInstance().computeCodeHash();
}

export {
  configureConnection,
  connectSerial,
  disconnectSerial,
  compileAndUpload,
  decorateEditor,
  removeAnnotationsFromCode,
  registerSideView,
  toggleHighlight,
  onInput,
};
