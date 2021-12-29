"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileAndUpload = exports.disconnectSerial = exports.connectSerial = exports.configureConnection = exports.initializeProject = void 0;
const ui = require("./ui");
const arduino_cli_1 = require("./arduino-cli");
const virtual_arduino_1 = require("./virtual-arduino");
const codeManager_1 = require("./codeManager");
const extension = require("./extension_support");
async function configureConnection() {
    // Configure arduino-cli board
    const selectBoard = async () => {
        const list = Object.keys(arduino_cli_1.ArduinoBoard);
        const pick = await ui.showQuickPick(list, 'Choose your board');
        if (!pick)
            return; // cancel
        const fqbn = arduino_cli_1.ArduinoBoard[pick];
        return fqbn;
    };
    const selectBaud = async () => {
        const lsbaud = virtual_arduino_1.VirtualArduino.getInstance().getAvailableBuadRate();
        const pick = await ui.showQuickPick(lsbaud, 'Pick your buad rate');
        if (!pick)
            return;
        return parseInt(pick);
    };
    const selectPort = async () => {
        const ports = await arduino_cli_1.ArduinoCli.getInstance().listAvailablePorts();
        return await ui.showQuickPick(ports, 'Pick your serial port');
    };
    const fqbn = await selectBoard();
    if (!fqbn)
        return;
    const baud = await selectBaud();
    if (!baud)
        return;
    const port = await selectPort();
    if (!port)
        return;
    try {
        arduino_cli_1.ArduinoCli.getInstance().init(fqbn, port);
        virtual_arduino_1.VirtualArduino.getInstance().configure(baud, port, onSerialData);
        ui.vsInfo('Configuration saved');
    }
    catch (e) {
        ui.vsError(e.message);
    }
}
exports.configureConnection = configureConnection;
function onSerialData(data) {
    console.log('Data received: ' + data);
}
function connectSerial() {
    try {
        virtual_arduino_1.VirtualArduino.getInstance().connectSerial();
        ui.vsInfo('Connection open');
    }
    catch (e) {
        ui.vsError(e.message);
    }
}
exports.connectSerial = connectSerial;
function disconnectSerial() {
    try {
        virtual_arduino_1.VirtualArduino.getInstance().disconnectSerial();
        ui.vsInfo('Connection closed');
    }
    catch (e) {
        ui.vsError(e.message);
    }
}
exports.disconnectSerial = disconnectSerial;
async function initializeProject() {
    const workspace = await extension.getCurrentWorkspace();
    const workspaceName = workspace.name;
    // Wanna continue?
    const ans = await ui.confirmationMessage('Are you sure you want to override your project?', ['Yes', 'No']);
    if (ans === 'No' || ans === undefined)
        return; // bye bye
    // Copy ino file template
    await extension.copyFileOrFolder(extension.templatesFolderUri(), // src folder
    'sketch.ino', // src file
    workspace.uri, // target folder
    workspaceName + '.ino' // target file
    );
    // Copy folder with code library
    await extension.copyFileOrFolder(extension.templatesFolderUri(), // src folder
    'dependencies', workspace.uri, extension.buildFolderName());
}
exports.initializeProject = initializeProject;
function compileAndUpload() {
    /*
      // const ws = await extension.getCurrentWorkspace()!.uri;
      const ws = await extension.getBuildFolderUri();
      */
    const newCode = codeManager_1.CodeManager.getInstance().parseAndGenerateCode();
    console.log(newCode);
    /*
      saveFile(newCode);
  
      try {
        await ArduinoCli.getInstance().compileSketch(ws);
        await ArduinoCli.getInstance().uploadSketch(ws);
        ui.vsInfo('Sketch succssfully uploaded');
      } catch (e) {
        if (e instanceof Error) {
          ui.vsError(e.message);
        } else {
          ui.vsError('Compilation / uploading error');
          console.log(e);
        }
      }*/
}
exports.compileAndUpload = compileAndUpload;
//# sourceMappingURL=extension.js.map