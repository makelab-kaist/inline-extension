import * as vscode from 'vscode';
import * as parser from './parser';
import { generateLibraryCode } from './arduino-lib/arduino-library';
// import { libCode } from './arduino-lib/inoCodeTemplate'; // import the whoole library

type CodeQuery = {
  id: string;
  line: number;
  column: number;
  expression: string;
};

class CodeManager {
  private static instance: CodeManager;
  private codeHash: string = '';

  private constructor() {}

  // Singleton
  static getInstance() {
    if (!CodeManager.instance) this.instance = new CodeManager();
    return this.instance;
  }

  // Has code changed by checking signature
  isCodeDirty(): boolean {
    return this.codeHash !== this.computeCodeHash();
  }

  // Update code signature
  invalidateCode() {
    this.codeHash = this.computeCodeHash();
  }

  // Get code
  getCurrentCode(): string {
    const doc = vscode.window.activeTextEditor?.document;
    if (!doc || doc.isUntitled) {
      throw new Error('No valid document open');
    }
    return doc.getText();
  }

  // Generated instrumented code
  generateInstrumentedCode(): string {
    const code = this.getCurrentCode();

    const fundata: parser.LineData[] = this.getFunctionCalls();

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

  // TODO
  getCodeQueries(): CodeQuery[] {
    const lines = this.getFilteredLines('query');
    return lines.map(({ id, line, data }) => {
      const expression = data[0]?.expression || '';
      const column = data[0].location.startCol;
      return { id, line, column, expression };
    });
  }

  // ======= PRIVATE METHODS ========

  // Compute code signature
  private computeCodeHash(): string {
    const code = this.getCurrentCode();
    const allIds = CodeManager.getInstance()
      .getFunctionCalls()
      .map(({ id }) => id);

    return allIds.join('-');
  }

  // Get list of calls with valid functions to be instrumented
  private getFunctionCalls(): parser.LineData[] {
    return this.getFilteredLines('function');
  }

  // Get lines of code parsed as functions or query expressions
  private getFilteredLines(
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

  // Generate the instrumented code
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

export { CodeManager, CodeQuery };
