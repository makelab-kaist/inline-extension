/**
 * Manger used to generate code or extract ExpressionQueries
 */
import * as vscode from 'vscode';
import * as parser from './parser';
// Library with code generated depending on which functions are called
import { generateLibraryCode } from './arduino-utils/arduino-library';
// Library with all the instrumented code, regardless of the usage
// import { libCode } from './arduino-lib/inoCodeTemplate'; // import the whole library

// This the data with a query of the form: // [Expression] ?
export type ExpressionQuery = {
  id: string;
  line: number;
  column: number;
  expression: string;
};

export class CodeManager {
  private static instance: CodeManager;
  private codeHash: string = '';

  private constructor() {}

  // Singleton
  static getInstance() {
    if (!CodeManager.instance) this.instance = new CodeManager();
    return this.instance;
  }

  // Get a list of Code queries of the form: // [expression] ?
  getExpressionQueries(): ExpressionQuery[] {
    const lines = this.getFilteredLines('query');
    return lines.map(({ id, line, data }) => {
      const expression = data[0]?.expression || '';
      const column = data[0].location.startCol;
      return { id, line, column, expression };
    });
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

      console.log(newText);

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

  // Has code changed by checking signature
  isCodeDirty(): boolean {
    return this.codeHash !== this.computeCodeHash();
  }

  // Update code signature
  updateCodeHash() {
    this.codeHash = this.computeCodeHash();
  }

  // Disable annotations by removing the last questionmark: // [expression] ? => // [expression]
  disableAnnotations(): string {
    const code = this.getCurrentCode();
    const lines = code.split('\n');
    const queries: parser.LineData[] =
      CodeManager.getInstance().getFilteredLines('query');

    // Loop for the lines with //? and remove those
    for (let { id, line, data } of queries) {
      const editorLine = line - 1; // adjust -1 because vscode editor lines starts at 1
      const textLine = lines[editorLine];
      const { location } = data[0];
      const newText = textLine.slice(0, location.endCol - 1);
      lines[editorLine] = newText;
    }
    const newCode = lines.join('\n');
    return newCode;
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
    const lines: parser.LineData[] = parser.treeSitterGetParseData(code);

    // const lines: parser.LineData[] = parser.getParsedData(code);

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
    data: parser.FunctionOrQueryData[]
  ): string {
    let result = text;

    const items = data.length;
    let index = items;
    let delta = 0;

    for (let { function: funcName, args, location } of data.reverse()) {
      const s = location.startCol;
      const e = location.endCol - 1;

      // Serial.print and Serial.println have a dot, that should be replaced with a dash
      if (funcName!.includes('.')) funcName = funcName!.replace('.', '_');

      console.log(funcName);

      let newFuncCall = `_${funcName}(${args},"${id}",${line},${index},${items}`;
      if (args === '') {
        // no args
        newFuncCall = `_${funcName}("${id}",${line},${index},${items}`;
      }
      result = result.substring(0, s) + newFuncCall + result.substring(e);
      delta = result.length - text.length + 1;

      index--;
      console.log(result);
    }

    console.log('rsult ', result);
    return result;
  }
}
