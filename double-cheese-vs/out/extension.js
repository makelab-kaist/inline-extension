"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initProject = exports.closeConnection = exports.compileAndUpload = exports.configureAndConnect = void 0;
const vscode = require("vscode");
const ui = require("./ui");
const arduino_cli_1 = require("./arduino-cli");
const virtual_arduino_1 = require("./virtual-arduino");
const extension = require("./extension_support");
const parsers_1 = require("./parsers/parsers");
const fs_1 = require("fs");
// Globals
const EXTENSION_ID = 'MAKinteract.double-cheese';
// DIRECTORIES
function extensionUri() {
    return vscode.extensions.getExtension(EXTENSION_ID).extensionUri;
}
function templatesFolderUri(subdirs = []) {
    return vscode.Uri.joinPath(extensionUri(), 'src', 'templates', ...subdirs);
}
async function configureAndConnect() {
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
    arduino_cli_1.ArduinoCli.getInstance().init(fqbn, port);
    virtual_arduino_1.VirtualArduino.getInstance().connect(baud, port, onSerialData);
    ui.vsInfo('Connection open');
}
exports.configureAndConnect = configureAndConnect;
function prepend(code, toPrePend) {
    return toPrePend + '\n' + code;
}
function getSubstitution(tok) {
    const args = tok.args.join(',');
    return `_${tok.name}(${args},${tok.id},${tok.location.lineNo})`;
}
function replaceWithTokens(code, tokens) {
    const lines = code.split('\n');
    for (let tok of tokens.reverse()) {
        const line = tok.location.lineNo - 1;
        const s = tok.location.startCol;
        const e = tok.location.endCol;
        const text = lines[line];
        lines[line] =
            text.substring(0, s) + getSubstitution(tok) + text.substring(e);
    }
    return lines.join('\n');
}
async function saveFile(code) {
    const wsedit = new vscode.WorkspaceEdit();
    const wsPath = (await extension.getBuildFolderUri())?.fsPath;
    if (!wsPath)
        return;
    const filePath = vscode.Uri.file(wsPath + '/.out.ino');
    (0, fs_1.writeFileSync)(filePath.path, code, {});
}
function decorateTokens(tokens) {
    const linesCount = [];
    for (let tok of tokens) {
        const line = tok.location.lineNo;
        tok.lineId = linesCount.filter((x) => x === line).length;
        linesCount.push(line);
        tok.md5Id = tok.md5.substring(0, 6);
    }
}
async function compileAndUpload() {
    // const ws = await extension.getCurrentWorkspace()!.uri;
    const ws = await extension.getBuildFolderUri();
    const doc = vscode.window.activeTextEditor?.document;
    if (!doc || doc.isUntitled) {
        ui.vsError('No valid document open');
        return;
    }
    const code = doc.getText();
    const tokens = parsers_1.tokenParser.parse(code);
    const newCode = prepend(replaceWithTokens(code, tokens), `#include "ExtensionHelpers.h"`);
    decorateTokens(tokens);
    saveFile(newCode);
    try {
        await arduino_cli_1.ArduinoCli.getInstance().compileSketch(ws);
        await arduino_cli_1.ArduinoCli.getInstance().uploadSketch(ws);
        ui.vsInfo('Sketch succssfully uploaded');
    }
    catch (e) {
        if (e instanceof Error) {
            ui.vsError(e.message);
        }
        else {
            ui.vsError('Compilation / uploading error');
            console.log(e);
        }
    }
}
exports.compileAndUpload = compileAndUpload;
function onSerialData(data) {
    console.log('here ' + data);
}
function closeConnection() {
    virtual_arduino_1.VirtualArduino.getInstance().disconnect();
    ui.vsInfo('Connection closed');
}
exports.closeConnection = closeConnection;
async function initProject() {
    const workspace = await extension.getCurrentWorkspace();
    const workspaceName = workspace.name;
    // Wanna continue?
    const ans = await ui.confirmationMessage('Are you sure you want to override your project?', ['Yes', 'No']);
    if (ans === 'No' || ans === undefined)
        return; // bye bye
    // Copy ino file template
    await extension.copyFileOrFolder(templatesFolderUri(), // src folder
    'sketch.ino', // src file
    workspace.uri, // target folder
    workspaceName + '.ino' // target file
    );
    // Copy folder with code library
    await extension.copyFileOrFolder(templatesFolderUri(), // src folder
    'dependencies', workspace.uri, extension.getBuildFolderName());
}
exports.initProject = initProject;
//# sourceMappingURL=extension.js.map