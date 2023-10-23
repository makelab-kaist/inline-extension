/**
 * Expression engine and context
 */
import * as vscode from 'vscode';
import { appendFile } from 'fs';
import { LowPassFilter } from './vendor/OneEuroFilter';

// The result of an evaluated expression
export type ExpressionResult = {
  value: any[];
  stringValue: string;
  outputFormat: 'inline' | 'histogram' | 'linegraph';
};

// The Engine evaluates an expression within a context
export class ExpressionEngine {
  private static instance: ExpressionEngine;
  private context = new Context();

  // Singleton
  static getInstance() {
    if (!ExpressionEngine.instance) this.instance = new ExpressionEngine();
    return this.instance;
  }

  // Eval in context: might throw an error
  evalExpression(expr: string): any | never {
    try {
    } catch (error) {}
    return new Function(`return eval('${expr}')`).call(this.context);
    // return new Function(`return ${src}`).call(this.context);
  }

  // Get a new context
  clear() {
    this.context = new Context();
  }
}

// The context with some built-in functions
class Context {
  private fil!: LowPassFilter;
  private filterAlpha: number = 0;
  private counter: number = 0;

  // Create a new context and initialize it
  constructor() {
    this.filterAlpha = 1;
    this.fil = new LowPassFilter(this.filterAlpha);
    this.counter = 0;
  }

  // pipe utility to run the following functions
  pipe(...fns: Array<(v: any) => any>) {
    return (x: any) => fns.reduce((v, f) => f(v), x);
  }

  // Assert and print
  assert(exp: boolean): string {
    return exp ? '✅' : '❌';
  }

  // Allow pass through if same
  is(toCompare: any): (input: any) => boolean {
    return function (input: any): boolean {
      return input == toCompare; // == is loose on purpose
    };
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
  lpfilter(alpha: number = 1): (input: number) => any {
    return (input: number) => {
      if (typeof input !== 'number')
        throw new Error(`"${input}" is not a number`);
      // Filter it
      if (alpha !== this.filterAlpha) {
        this.filterAlpha = alpha;
        this.fil = new LowPassFilter(this.filterAlpha);
      }
      const res = this.fil.filterWithAlpha(input, alpha);

      // return res.toFixed(1);
      return ~~res; // float to int fast convertion
    };
  }

  // save to context
  save(variableName: string): (input: any) => any {
    return (input: any) => {
      (this as any)[`${variableName.trim()}`] = input;
      return input;
    };
  }

  // count
  count(counter: string): (input: number) => number {
    return (input: number): number => {
      const counters = this as any;
      if (counters[`${counter.trim()}`] === undefined)
        counters[`${counter.trim()}`] = 0;
      if (input) counters[`${counter.trim()}`] += 1;
      return counters[`${counter.trim()}`];
    };
  }

  // count
  add(accumulator: string): (input: number) => number {
    return (input: number): number => {
      const counters = this as any;
      if (counters[`${accumulator.trim()}`] === undefined)
        counters[`${accumulator.trim()}`] = 0;
      counters[`${accumulator.trim()}`] += input;
      return counters[`${accumulator.trim()}`];
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
  log(filename: string = 'logs.txt'): (dataLog: any) => any {
    return function (dataToLog: any) {
      const document = vscode.window.activeTextEditor?.document;

      if (!document) return undefined;
      const ws = vscode.workspace.getWorkspaceFolder(document?.uri);
      if (!ws) return undefined;
      const now = new Date().toLocaleTimeString(); // e.g., 11:18:48 AM
      const data = dataToLog ? dataToLog : '';
      const toLog = `${data},${now}`;

      if (filename.split('.').length === 1) {
        // no extension? add it
        filename += '.txt';
      }

      appendFile(
        vscode.Uri.joinPath(ws.uri, `${filename}`).fsPath,
        `${toLog}\n`,
        function (err) {
          if (err) console.log(err);
        }
      );
      return dataToLog;
    };
  }

  // onvert to voltage
  volt(voltReference: number = 5): (input: number) => any {
    return function (input: any) {
      const mapping: number = parseFloat(
        ((input / 1024) * voltReference).toFixed(2)
      );
      return mapping;
    };
  }

  // One function to support plugging a function
  map(fn: (inputParam: any) => any): (input: any) => any {
    return (input: any) => {
      return fn(input);
    };
  }

  filter(fn: (inputParam: any) => any): (input: any) => any {
    return (input: any) => {
      return fn(input) ? input : undefined;
    };
  }

  // min and max
  min(varname: string): (input: number) => number {
    return (input: number): number => {
      const mins = this as any;
      if (mins[`${varname.trim()}`] === undefined)
        mins[`${varname.trim()}`] = Number.MAX_VALUE;
      const result = Math.min(mins[`${varname.trim()}`], input);
      mins[`${varname.trim()}`] = result;
      return input;
    };
  }

  max(varname: string): (input: number) => number {
    return (input: number): number => {
      const maxs = this as any;
      if (maxs[`${varname.trim()}`] === undefined)
        maxs[`${varname.trim()}`] = Number.MIN_VALUE;
      const result = Math.max(maxs[`${varname.trim()}`], input);
      maxs[`${varname.trim()}`] = result;
      return input;
    };
  }
}
