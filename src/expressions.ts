import * as vscode from 'vscode';
import { appendFile } from 'fs';
import { LowPassFilter } from './vendor/OneEuroFilter';

class Context {
  private fil!: LowPassFilter;
  private filterAlpha: number = 0;

  constructor() {
    this.filterAlpha = 1;
    this.fil = new LowPassFilter(this.filterAlpha);
  }

  assert(exp: boolean) {
    return exp ? '🟢' : '🔴';
  }

  print(...params: any) {
    return params.join(' ');
  }

  above(v: number, threshold: number) {
    return v > threshold ? v : undefined;
  }

  below(v: number, threshold: number) {
    return v < threshold ? v : undefined;
  }

  between(v: number, low: number, high: number) {
    return v >= low && v <= high ? v : undefined;
  }

  log(v: number, filename: string = 'logs.txt', tag: string = '') {
    const document = vscode.window.activeTextEditor?.document;

    if (!document) return undefined;
    const ws = vscode.workspace.getWorkspaceFolder(document?.uri);
    if (!ws) return undefined;
    const now = new Date().toLocaleTimeString(); // e.g., 11:18:48 AM
    if (tag) tag += ','; // add a comma
    const data = v ? v : '';
    const toLog = `${tag}${data},${now}`;

    appendFile(
      vscode.Uri.joinPath(ws.uri, `${filename}`).fsPath,
      `${toLog}\n`,
      function (err) {
        if (err) console.log(err);
      }
    );
    return toLog;
  }

  filter(input: number, alpha: number = 1) {
    if (alpha !== this.filterAlpha) {
      this.filterAlpha = alpha;
      this.fil = new LowPassFilter(this.filterAlpha);
    }
    const res = this.fil.filterWithAlpha(input, alpha);
    console.log(res);

    return res.toFixed(1);
  }
}

type EvaluationResult = {
  success: boolean;
  value: string;
};

export class ExpressionEngine {
  private static instance: ExpressionEngine;
  private context = new Context();

  static getInstance() {
    if (!ExpressionEngine.instance) this.instance = new ExpressionEngine();
    return this.instance;
  }

  evalInContext(expr: string): EvaluationResult {
    const src = expr.replaceAll('$', 'this.');
    let result: EvaluationResult = { value: '', success: false };

    try {
      result.value = new Function(`return eval('${src}')`).call(this.context);
      result.success = true;
      // return new Function(`return ${src}`).call(this.context);
    } catch (err) {
      result.value = `Invalid Expression: ${err}`;
      result.success = false;
    }
    return result;
  }

  clear() {
    this.context = new Context();
  }
}
