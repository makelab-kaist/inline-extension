import * as vscode from 'vscode';
import * as ui from './ui';

import { ArduinoAck, VirtualArduino } from './virtual-arduino';
import * as parser from './parser';
import { CodeManager } from './codeManager';
import { addAndShowAnnotation } from './annotations';

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
  const [id, line, value] = data.slice(1).split(','); // e.g., $b4999c,9,1
  console.log(id, line, value);
  // createAnnotation(id, +line);
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
    // removeAllAnnotations();
    // Get all the lines with the '//?' queries
    const queries: parser.LineData[] =
      CodeManager.getInstance().getFilteredLines('query');

    queries.forEach(({ id, line }) => {
      // createAnnotation(id, line);
      addAndShowAnnotation(id, line, 'NaN', {
        color: 'green',
        backgroundColor: 'none',
        highlightColor: 'yellow',
      });
    });
    // console.log(JSON.stringify(queries, null, ' '));
  } catch (err: any) {
    ui.vsError(err.message);
    return;
  }
}

function hello() {
  // createAnnotation('1231', 1);
  // addAndShowAnnotation('1231', 1, 'hello');
  // let i = 0;
  // setInterval(() => {
  //   updateAnnotation('1231', `${i++}`);
  // }, 5000);
}

export {
  configureConnection,
  connectSerial,
  disconnectSerial,
  compileAndUpload,
  decorateEditor,
  hello,
};
