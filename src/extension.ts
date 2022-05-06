import * as vscode from 'vscode';
import * as ui from './ui';

import { ArduinoAck, VirtualArduino } from './virtual-arduino';
import * as parser from './parser';
import { CodeManager } from './codeManager';
import { createAnnotation, removeAnnotations } from './annotations';

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
  const ans = await ui.confirmationMessage('Connect to server', ['Yes', 'No']);
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
  const [id, line, value] = data.slice(1).split(','); // e.g., $b4999c,9,1
  console.log(id, line, value);
  createAnnotation(id, +line, value);
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
    removeAnnotations();
    // Get all the lines with the '//?' queries
    const queries: parser.LineData[] =
      CodeManager.getInstance().getFilteredLines('query');

    queries.forEach(({ id, line }) => {
      createAnnotation(id, line);
    });
    // console.log(JSON.stringify(queries, null, ' '));
  } catch (err: any) {
    ui.vsError(err.message);
    return;
  }
}

/*type AnnotationOptions = {
  color?: string;
  backgroundColor?: string;
};

function createDecoration(
  activeEditor: vscode.TextEditor,
  contentText: string,
  line: number,
  { color = 'green', backgroundColor = 'none' }: AnnotationOptions = {
    color: 'green',
    backgroundColor: 'none',
  }
): vscode.TextEditorDecorationType {
  const end = 10000; // a large number

  const range = new vscode.Range(
    new vscode.Position(line - 1, end), // lines starts at 0
    new vscode.Position(line - 1, end) // lines start at 0
  );

  const decoration = vscode.window.createTextEditorDecorationType({
    after: {
      contentText,
      color,
      margin: '20px',
      backgroundColor: 'none',
    },
  });
  activeEditor?.setDecorations(decoration, [{ range }]);

  return decoration;
}*/

function hello() {
  createAnnotation('1231', 1);
  let i = 0;
  setInterval(() => {
    createAnnotation('1231', 1, `${i++}`);
  }, 1000);
}

export {
  configureConnection,
  connectSerial,
  disconnectSerial,
  compileAndUpload,
  decorateEditor,
  hello,
};
