import * as vscode from 'vscode';
import { io, Socket } from 'socket.io-client';

import * as ui from './ui';
import { ArduinoCli, ArduinoBoard, ArduinoPlatform } from './arduino-cli';
import { VirtualArduino } from './virtual-arduino';
import * as extension from './extension_support';
import { tokenParser, TextLocation, Token } from './parsers/parsers';
import { writeFile, writeFileSync } from 'fs';

// Globals
const EXTENSION_ID = 'MAKinteract.double-cheese';

// DIRECTORIES

function extensionUri(): vscode.Uri {
  return vscode.extensions.getExtension(EXTENSION_ID)!.extensionUri;
}

function templatesFolderUri(subdirs: string[] = []): vscode.Uri {
  return vscode.Uri.joinPath(extensionUri(), 'src', 'templates', ...subdirs);
}

async function configureAndConnect() {
  // Configure arduino-cli board
  const selectBoard = async () => {
    const list = Object.keys(ArduinoBoard);
    const pick = await ui.showQuickPick(list, 'Choose your board');
    if (!pick) return; // cancel
    const fqbn: ArduinoBoard = ArduinoBoard[pick as keyof typeof ArduinoBoard];
    return fqbn;
  };

  const selectBaud = async () => {
    const lsbaud = VirtualArduino.getInstance().getAvailableBuadRate();
    const pick = await ui.showQuickPick(lsbaud, 'Pick your buad rate');
    if (!pick) return;
    return parseInt(pick);
  };

  const selectPort = async () => {
    const ports = await ArduinoCli.getInstance().listAvailablePorts();
    return await ui.showQuickPick(ports, 'Pick your serial port');
  };

  const fqbn = await selectBoard();
  if (!fqbn) return;

  const baud = await selectBaud();
  if (!baud) return;

  const port = await selectPort();
  if (!port) return;

  ArduinoCli.getInstance().init(fqbn, port);
  VirtualArduino.getInstance().connect(baud, port, onSerialData);
  ui.vsInfo('Connection open');
}

function prepend(code: string, toPrePend: string): string {
  return toPrePend + '\n' + code;
}

function getSubstitution(tok: Token): string {
  const args = tok.args.join(',');
  return `_${tok.name}(${args},${tok.id},${tok.location.lineNo})`;
}

function replaceWithTokens(code: string, tokens: Token[]): string {
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

async function saveFile(code: string) {
  const wsedit = new vscode.WorkspaceEdit();
  const wsPath = (await extension.getBuildFolderUri())?.fsPath;
  if (!wsPath) return;
  const filePath = vscode.Uri.file(wsPath + '/.out.ino');
  writeFileSync(filePath.path, code, {});
}

function decorateTokens(tokens: Token[]): void {
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
  const tokens: Token[] = tokenParser.parse(code);

  const newCode = prepend(
    replaceWithTokens(code, tokens),
    `#include "ExtensionHelpers.h"`
  );
  decorateTokens(tokens);
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
  }
}

function onSerialData(data: string) {
  console.log('here ' + data);
}

function closeConnection() {
  VirtualArduino.getInstance().disconnect();
  ui.vsInfo('Connection closed');
}

async function initProject() {
  const workspace = await extension.getCurrentWorkspace();
  const workspaceName = workspace.name;

  // Wanna continue?
  const ans = await ui.confirmationMessage(
    'Are you sure you want to override your project?',
    ['Yes', 'No']
  );
  if (ans === 'No' || ans === undefined) return; // bye bye

  // Copy ino file template
  await extension.copyFileOrFolder(
    templatesFolderUri(), // src folder
    'sketch.ino', // src file
    workspace.uri, // target folder
    workspaceName + '.ino' // target file
  );

  // Copy folder with code library
  await extension.copyFileOrFolder(
    templatesFolderUri(), // src folder
    'dependencies',
    workspace.uri,
    extension.getBuildFolderName()
  );
}

export { configureAndConnect, compileAndUpload, closeConnection, initProject };
