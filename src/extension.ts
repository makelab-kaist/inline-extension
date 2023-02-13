import * as vscode from 'vscode';
import * as ui from './ui/vscode-ui';
import { ArduinoAck, VirtualArduino } from './utils/virtual-arduino';
import { CodeManager } from './codeManager';
import { SideViewProvider } from './ui/sidebarViewProvider';
import { Subject } from 'rxjs';
const { name, publisher } = require('../package.json');

type LineData = {
  id: string;
  line: number;
  values: string[];
};

let sideView: SideViewProvider;
let highlight: boolean = true;
const data$ = new Subject();

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

async function changeServer() {
  let ip = await ui.showInputBox('', 'http://localhost', () => false);
  if (!ip) return;
  if (!ip.startsWith('http://')) {
    ip = 'http://' + ip;
  }
  VirtualArduino.changeServerIp(ip);
}

function onSerialData(ack: ArduinoAck) {
  if (!ack.success) return;
  const data = ack.message as string;

  if (data.charAt(0) !== '$') return;
  const [id, line, ...values] = data.slice(1).split(','); // e.g., $b4999c,9,1
  data$.next({ id, line: +line, values }); // broadcast
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
    // Get all lines with valid code
    const code = CodeManager.getInstance().generateInstrumentedCode();

    // Compile and upload
    VirtualArduino.getInstance()
      .compileAndUpload(code)
      .then(([message, link]: string[]) => {
        ui.vsInfoWithLink(message, link);
        CodeManager.getInstance().invalidateCode();
        sideView?.sendMessage({ message: 'codeDirty', value: false });
      })
      .catch((msg) => ui.vsError(msg));
  } catch (err: any) {
    ui.vsError(err.message);
    return;
  }
}

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

function getExtension(): vscode.Extension<any> {
  return vscode.extensions.getExtension(`${publisher}.${name}`)!; // I know I exist
}

function getExtensionPath(): string {
  return getExtension()?.extensionPath;
}

function getExtensionUri(): vscode.Uri {
  return vscode.Uri.file(getExtensionPath());
}

/*
function removeAnnotationsFromCode() {
  // swap code
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    ui.vsError('Not a valid file');
    return;
  }
  const newCode = CodeManager.getInstance().removeAnnotationsFromCode();

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
*/

///// Modify below

function onInput() {
  // check if the code was modified
  sideView?.sendMessage({
    message: 'codeDirty',
    value: CodeManager.getInstance().isCodeDirty(),
  });
}

function decorateEditor() {
  /*try {
    // remove all annotations if they exist
    // removeAllAnnotations();
    // Get all the lines with the '//?' queries
    const queries: parser.LineData[] =
      CodeManager.getInstance().getCodeQueries();

    queries.forEach(({ id, line, data }) => {
      const expression = data[0].expression;
      // addAnnotation(id, line, 'NaN', expression, 'DodgerBlue');
    });
  } catch (err: any) {
    ui.vsError(err.message);
    return;
  }*/
}

function toggleHighlight() {
  highlight = !highlight;
  // if (!highlight) removeHighlightLine();
  sideView?.sendMessage({ message: 'toggleHighlight', highlight });
}

export {
  data$,
  LineData,
  configureConnection,
  connectSerial,
  disconnectSerial,
  compileAndUpload,
  compileAndUploadRelease,
  decorateEditor,
  registerSideView,
  toggleHighlight,
  startConnectionToServer,
  changeServer,
  getExtension,
  getExtensionPath,
  getExtensionUri,
};
