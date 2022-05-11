import * as vscode from 'vscode';
import * as ui from './ui';
import { ArduinoAck, VirtualArduino } from './virtual-arduino';
import * as parser from './parser';
import { CodeManager } from './codeManager';
import {
  updateAnnotation,
  addAnnotation,
  removeAllAnnotations,
} from './annotations';
import { SideViewProvider } from './sidebarViewProvider';

let sideView: SideViewProvider;

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
    .then((msg) => ui.vsInfo(msg))
    .catch((msg) => ui.vsError(msg));
}

function onSerialData(ack: ArduinoAck) {
  if (!ack.success) return;
  const data = ack.message as string;
  // console.log(data);

  // should start with $
  if (data.charAt(0) !== '$') return;
  const [id, line, ...values] = data.slice(1).split(','); // e.g., $b4999c,9,1
  // console.log(id, line, values);
  updateAnnotation(id, +line, {
    contentText: values.toString(),
    color: 'green',
  });
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
      })
      .catch((msg) => ui.vsError(msg));
  } catch (err: any) {
    ui.vsError(err.message);
    return;
  }
}

function decorateEditor() {
  try {
    // remove all annotations if they exist
    removeAllAnnotations();
    // Get all the lines with the '//?' queries
    const queries: parser.LineData[] =
      CodeManager.getInstance().getFilteredLines('query');

    queries.forEach(({ id, line }) => {
      addAnnotation(id, line, {
        contentText: 'NaN',
        color: 'grey',
      });
    });
    // console.log(JSON.stringify(queries, null, ' '));
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

function hello() {
  sideView?.sendMessage('hi');
}

export {
  configureConnection,
  connectSerial,
  disconnectSerial,
  compileAndUpload,
  decorateEditor,
  removeAnnotationsFromCode,
  registerSideView,
  hello,
};
