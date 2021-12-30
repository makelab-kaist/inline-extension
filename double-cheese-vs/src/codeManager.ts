import * as vscode from 'vscode';
import * as parser from './parser';

class CodeManager {
  private static instance: CodeManager;

  private constructor() {}

  static getInstance() {
    if (!CodeManager.instance) this.instance = new CodeManager();
    return this.instance;
  }

  parseAndGenerateCode(): string | never {
    // Get current Code
    const doc = vscode.window.activeTextEditor?.document;
    if (!doc || doc.isUntitled) {
      throw new Error('No valid document open');
    }
    const code = doc.getText();

    // Parse and generate new code
    let result = code;
    try {
      const fundata: parser.FunctionData[] = parser.getFunctionsData(code);
      result = this.generateCode(code, fundata);
    } catch (err) {
      console.error('Unable to parse the code');
    }
    return result;
  }

  private generateCode(code: string, fundata: parser.FunctionData[]): string {
    const lines = code.split('\n');
    let prevLine = -1; // out of range

    // Loop bottom up
    for (let tok of fundata.reverse()) {
      const line = tok.location.line - 1;
      const s = tok.location.startCol;
      const e = tok.location.endCol;
      const text = lines[line];

      const newLine = prevLine !== line; // we changed line
      prevLine = line;

      // substitute function call
      lines[line] =
        text.substring(0, s) +
        this.getSubstitutionCode(tok, newLine) +
        text.substring(e);
    }
    const newCode = lines.join('\n');

    // prepend library
    return this.prepend(`#include "ExtensionHelpers.h"`, newCode);
  }

  private prepend(toPrePend: string, code: string): string {
    return toPrePend + '\n' + code;
  }

  private getSubstitutionCode(
    tok: parser.FunctionData,
    newLine: boolean
  ): string {
    const fnName = tok.function;
    let args = '';
    if (tok.args.length > 0) {
      args = tok.args.join(',');
      args += ',';
    }

    return `_${fnName}(${args}${tok.location.line},${tok.index},${newLine})`;
  }
}

export { CodeManager };
