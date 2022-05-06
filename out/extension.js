"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hello = exports.decorateEditor = exports.compileAndUpload = exports.disconnectSerial = exports.connectSerial = exports.configureConnection = void 0;
const ui = require("./ui");
const virtual_arduino_1 = require("./virtual-arduino");
const codeManager_1 = require("./codeManager");
const annotations_1 = require("./annotations");
async function configureConnection() {
    const ports = await virtual_arduino_1.VirtualArduino.getInstance().getAvailablePorts();
    const selectPort = async () => {
        return await ui.showQuickPick(ports, 'Pick your serial port');
    };
    const selectBaud = async () => {
        const lsbaud = virtual_arduino_1.VirtualArduino.getInstance().getAvailableBuadRate();
        const pick = await ui.showQuickPick(lsbaud, 'Pick your buad rate');
        if (!pick)
            return;
        return parseInt(pick);
    };
    const portName = await selectPort();
    if (!portName)
        return;
    const baud = await selectBaud();
    if (!baud)
        return;
    // Autoconnect?
    const ans = await ui.confirmationMessage('Connect to server', ['Yes', 'No']);
    const autoConnect = ans === 'Yes';
    virtual_arduino_1.VirtualArduino.getInstance()
        .beginSerial({ portName, baud, autoConnect }, onSerialData)
        .then((msg) => ui.vsInfo(msg))
        .catch((msg) => ui.vsError(msg));
}
exports.configureConnection = configureConnection;
function onSerialData(ack) {
    if (!ack.success)
        return;
    const data = ack.message;
    // console.log(data);
    // should start with $
    if (data.charAt(0) !== '$')
        return;
    const [id, line, value] = data.slice(1).split(','); // e.g., $b4999c,9,1
    console.log(id, line, value);
    (0, annotations_1.createAnnotation)(id, +line, value);
}
function connectSerial() {
    virtual_arduino_1.VirtualArduino.getInstance()
        .connectSerial()
        .then((msg) => ui.vsInfo(msg))
        .catch((msg) => ui.vsError(msg));
}
exports.connectSerial = connectSerial;
function disconnectSerial() {
    virtual_arduino_1.VirtualArduino.getInstance()
        .disconnectSerial()
        .then((msg) => ui.vsInfo(msg))
        .catch((msg) => ui.vsError(msg));
}
exports.disconnectSerial = disconnectSerial;
function compileAndUpload() {
    try {
        // const code = CodeManager.getInstance().getCurrentCode();
        // Get all lines with valid code
        const lines = codeManager_1.CodeManager.getInstance().getFilteredLines('function');
        const code = codeManager_1.CodeManager.getInstance().generateCode(lines);
        // Compile and upload
        virtual_arduino_1.VirtualArduino.getInstance()
            .compileAndUpload(code)
            .then(([message, link]) => {
            ui.vsInfoWithLink(message, link);
        })
            .catch((msg) => ui.vsError(msg));
    }
    catch (err) {
        ui.vsError(err.message);
        return;
    }
}
exports.compileAndUpload = compileAndUpload;
function decorateEditor() {
    try {
        // remove all annotations if they exist
        (0, annotations_1.removeAnnotations)();
        // Get all the lines with the '//?' queries
        const queries = codeManager_1.CodeManager.getInstance().getFilteredLines('query');
        queries.forEach(({ id, line }) => {
            (0, annotations_1.createAnnotation)(id, line);
        });
        // console.log(JSON.stringify(queries, null, ' '));
    }
    catch (err) {
        ui.vsError(err.message);
        return;
    }
}
exports.decorateEditor = decorateEditor;
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
    (0, annotations_1.createAnnotation)('1231', 1);
    let i = 0;
    setInterval(() => {
        (0, annotations_1.createAnnotation)('1231', 1, `${i++}`);
    }, 1000);
}
exports.hello = hello;
//# sourceMappingURL=extension.js.map