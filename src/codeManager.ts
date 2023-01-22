import * as vscode from 'vscode';
import * as parser from './parser';
import { generateLibraryCode } from './arduino-library';
// import { libCode } from './inoCodeTemplate'; // import the whoole library

class CodeManager {
  private static _instance: CodeManager;

  private constructor() {}

  static getInstance() {
    if (!CodeManager._instance) this._instance = new CodeManager();
    return this._instance;
  }

  getCurrentCode(): string {
    const doc = vscode.window.activeTextEditor?.document;
    if (!doc || doc.isUntitled) {
      throw new Error('No valid document open');
    }
    return doc.getText();
  }

  computeCodeHash(): string {
    const code = this.getCurrentCode();
    const lines = code.split('\n');
    const allIds = CodeManager.getInstance()
      .getFilteredLines('function')
      .map(({ id }) => id);

    return allIds.join('-');
  }

  // remove all the //? from the current code
  removeQueriesFromCode(): string {
    const code = this.getCurrentCode();
    const lines = code.split('\n');
    const queries: parser.LineData[] =
      CodeManager.getInstance().getFilteredLines('query');

    // Loop for the lines with //? and remove those
    for (let { id, line, data } of queries) {
      const editorLine = line - 1; // adjust -1 because vscode editor lines starts at 1
      const textLine = lines[editorLine];
      const { location } = data[0];
      const newText = textLine.slice(0, location.startCol);
      lines[editorLine] = newText;
    }
    const newCode = lines.join('\n');
    return newCode;
  }

  generateCode(
    fundata: parser.LineData[],
    code: string | undefined = undefined
  ): string {
    if (!code) code = this.getCurrentCode();
    const lines = code.split('\n');

    // Loop for the lines of interest
    const functionsUsed: string[] = [];
    for (let { id, line, data } of fundata) {
      const editorLine = line - 1; // adjust -1 because vscode editor lines starts at 1
      const text = lines[editorLine];
      const newText = this.generateCodeForLine(id, line, text, data);
      lines[editorLine] = newText;
      // add function used
      functionsUsed.push(...data.map((fn) => fn.function!));
    }
    const newCode = lines.join('\n');

    const uniqueFunctionsUsed = [...new Set(functionsUsed)];
    const libCode = generateLibraryCode(uniqueFunctionsUsed);

    // add library
    return libCode + newCode;
  }

  getFilteredLines(
    queryType: 'function' | 'query',
    code: string | undefined = undefined
  ): parser.LineData[] {
    if (!code) code = this.getCurrentCode();
    const lines: parser.LineData[] = parser.getParsedData(code);

    // remap
    return (
      lines
        .map(({ id, line, data }) => {
          return {
            id,
            line,
            data: data.filter(({ type }) => type === queryType),
          };
        })
        // filter
        .filter(({ data }) => data.length > 0)
    );
  }

  private generateCodeForLine(
    id: string,
    line: number,
    text: string,
    data: parser.Data[]
  ): string {
    let result = text;

    const items = data.length;
    let index = items;

    for (let { function: funcName, args, location } of data.reverse()) {
      const s = location.startCol;
      const e = location.endCol - 1;

      // Serial.print and Serial.println have a dot, that should be replaced with a dash
      if (funcName!.includes('.')) funcName = funcName!.replace('.', '_');

      let newFuncCall = `_${funcName}(${args},"${id}",${line},${index},${items}`;
      if (args === '') {
        // no args
        newFuncCall = `_${funcName}("${id}",${line},${index},${items}`;
      }
      result = result.substring(0, s) + newFuncCall + result.substring(e);
      index--;
    }

    return result;
  }
}

export { CodeManager };
