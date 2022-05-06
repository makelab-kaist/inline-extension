import * as vscode from 'vscode';
import * as ui from './ui';

import { ArduinoAck, VirtualArduino } from './virtual-arduino';
import * as parser from './parser';
import { CodeManager } from './codeManager';

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

function onSerialData(data: ArduinoAck) {
  if (data.success) console.log('Data received: ' + data.message);
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

/*





async function saveFileInBuild(code: string) {
  const build = await extension.buildFolderUri();
  const out = vscode.Uri.joinPath(build, extension.buildFolderName() + '.ino');
  if (!out) return;
  writeFileSync(out.fsPath, code, {});
}

function updateLineInformation() {
  try {
    const code = CodeManager.getInstance().getCurrentCode();

    // Get all the lines with the '//?' queries
    const queries: parser.LineData[] =
      CodeManager.getInstance().getFilteredLines(code, 'query');

    // DecorationManager.getInstance.updateQueryList(queries);
    console.log(JSON.stringify(queries, null, ' '));
  } catch (err: any) {
    ui.vsError(err.message);
    return;
  }
}

function helloWorld() {
  const ae = vscode.window.activeTextEditor!;
  const q1 = new QueryDecoration(10, ae);
  const q2 = new QueryDecoration(12, ae);

  let i = 0;
  setInterval(() => {
    q1.show('hello ' + i);
    i += 1;
  }, 5000);

  let j = 0;
  setInterval(() => {
    q2.show('hello ' + j);
    j += 1;
  }, 1000);
  // CodeManager.getInstance().parseAndDecorate();
  // const test = `void setup()
  // {
  //   Serial.begin(115200);
  //   int a = digitalRead(2);
  //   Serial.println("Hello world"); //?
  // }
  // void loop()
  // {
  //   int a = digitalRead(2);
  // }`;
  // const result = getParsedData(test);
  // console.log(result);
}
*/

export {
  configureConnection,
  connectSerial,
  disconnectSerial,
  compileAndUpload,
};
