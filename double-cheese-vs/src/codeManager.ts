import * as vscode from 'vscode';
import * as parser from './parser';
import * as ui from './ui';

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
    const fundata: parser.FunctionData[] = parser.getFunctionsData(code);
    const result = this.generateCode(code, fundata);
    return result;
  }

  private generateCode(code: string, fundata: parser.FunctionData[]): string {
    const lines = code.split('\n');

    for (let tok of fundata.reverse()) {
      // bottom up
      const line = tok.location.line - 1;
      const s = tok.location.startCol;
      const e = tok.location.endCol;
      const text = lines[line];
      lines[line] =
        text.substring(0, s) +
        this.getSubstitutionCode(tok) +
        text.substring(e);
    }
    const newCode = lines.join('\n');

    return this.prepend(`#include "ExtensionHelpers.h"`, newCode);
  }

  private prepend(toPrePend: string, code: string): string {
    return toPrePend + '\n' + code;
  }

  private getSubstitutionCode(tok: parser.FunctionData): string {
    const args = tok.args.join(',');
    return `_${tok.function}(${args},"${tok.id}",${tok.location.line})`;
  }
}

export { CodeManager };
