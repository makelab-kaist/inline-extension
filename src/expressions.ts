import * as vscode from 'vscode';
import { appendFile } from 'fs';
import { LowPassFilter } from './vendor/OneEuroFilter';

// Evaluate an expression within a context
export class ExpressionEngine {
  private static instance: ExpressionEngine;
  private context = new Context();

  static getInstance() {
    if (!ExpressionEngine.instance) this.instance = new ExpressionEngine();
    return this.instance;
  }

  // Eval in context: might throw an error
  evalExpression(expr: string): any | never {
    return new Function(`return eval('${expr}')`).call(this.context);
    // return new Function(`return ${src}`).call(this.context);
  }

  clear() {
    this.context = new Context();
  }
}

class Context {
  private fil!: LowPassFilter;
  private filterAlpha: number = 0;

  constructor() {
    this.filterAlpha = 1;
    this.fil = new LowPassFilter(this.filterAlpha);
  }

  // pipe
  pipe(...fns: Array<(v: any) => any>) {
    return (x: any) => fns.reduce((v, f) => f(v), x);
  }

  // Assert and print
  assert(exp: boolean): string {
    return exp ? '✅' : '❌';
  }

  // Numeric comparisons
  above(threshold: number): (input: number) => any {
    return function (input: number) {
      if (typeof input !== 'number')
        throw new Error(`"${input}" is not a number`);
      return input > threshold ? input : undefined;
    };
  }

  below(threshold: number): (input: number) => any {
    return function (input: number) {
      if (typeof input !== 'number')
        throw new Error(`"${input}" is not a number`);
      return input < threshold ? input : undefined;
    };
  }

  between(low: number, high: number): (input: number) => any {
    return function (input: number) {
      if (typeof input !== 'number')
        throw new Error(`"${input}" is not a number`);
      return input >= low && input <= high ? input : undefined;
    };
  }

  // Filter value
  filter(alpha: number = 1): (input: number) => any {
    return (input: number) => {
      if (alpha !== this.filterAlpha) {
        this.filterAlpha = alpha;
        this.fil = new LowPassFilter(this.filterAlpha);
      }
      const res = this.fil.filterWithAlpha(input, alpha);
      console.log(res);

      return res.toFixed(1);
    };
  }

  // save to context
  save(variableName: string): (input: any) => any {
    return (input: any) => {
      (this as any)[`${variableName}`] = input;
      return input;
    };
  }

  // Output functions. Options are: [inline, histogram, linegraph]
  output(
    outputType: 'inline' | 'histogram' | 'linegraph'
  ): (list: [any]) => any {
    return function (...list: any[]) {
      return function (input: any) {
        const result = [input, ...list];
        return {
          value: result,
          stringValue: result.join(', '),
          outputFormat: outputType,
        };
      };
    };
  }

  // Logging value
  log(
    filename: string = 'logs.csv',
    tag: string = ''
  ): (filename: string, tag: string) => any {
    return function (dataToLog: any) {
      const document = vscode.window.activeTextEditor?.document;

      if (!document) return undefined;
      const ws = vscode.workspace.getWorkspaceFolder(document?.uri);
      if (!ws) return undefined;
      const now = new Date().toLocaleTimeString(); // e.g., 11:18:48 AM
      if (tag) tag += ','; // add a comma
      const data = dataToLog ? dataToLog : '';
      const toLog = `${tag}${data},${now}`;

      appendFile(
        vscode.Uri.joinPath(ws.uri, `${filename}`).fsPath,
        `${toLog}\n`,
        function (err) {
          if (err) console.log(err);
        }
      );
      return toLog;
    };
  }
}
