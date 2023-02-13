import * as vscode from 'vscode';
import { data$, LineData } from './extension';
import { CodeManager, CodeQuery } from './codeManager';
import { filter, Subject, Subscription, tap } from 'rxjs';
import {
  Decoration,
  HighlightDecoration,
  TextDecoration,
  WebViewDecoration,
  P5ViewDecoration,
} from './decoration';
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

class ExpressionEngine {
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

class Annotation {
  private sub: Subscription;
  private highlightDec: Decoration;
  private textDec: Decoration;
  private wv: P5ViewDecoration;

  constructor(
    private id: string,
    private line: number,
    private expression: string,
    data$: Subject<LineData>
  ) {
    // Create decorators for line and for text
    this.highlightDec = new HighlightDecoration(line);
    this.textDec = new TextDecoration(line);
    this.textDec.decorate({
      contentText: 'None',
    });
    this.wv = new P5ViewDecoration(line);
    // this.wv.decorate('<h1>Hi</h1><p>asdf</p>');
    this.wv.decorate();

    // Filted and subscribe
    this.sub = data$
      .pipe(filter((d) => id === d.id))
      .subscribe(({ values }: LineData) => {
        // Compute the result
        // const result = this.evalInContext(expression, expressionContext);
        // console.log(`"${expression}"`, expressionContext, result);
        let expr = expression.replaceAll('$$', values[0]);
        const { value, success } =
          ExpressionEngine.getInstance().evalInContext(expr);
        let color: string = 'DodgerBlue';

        // Update decorations
        this.highlightDec.decorate(500);
        this.textDec.decorate({
          contentText: `${value}`,
          color,
        });
      });
  }

  dispose() {
    this.highlightDec.dispose();
    this.textDec.dispose();
    this.sub?.unsubscribe();
  }
}

///////

let annotations: Annotation[] = [];

// id, line, values_on_line, expression, decoration
function createAnnotations() {
  const queries = CodeManager.getInstance().getCodeQueries();

  // if they exist, remove them
  if (annotations.length > 0) clearAnnotations();

  annotations = queries.map(
    ({ id, line, expression }: CodeQuery) =>
      new Annotation(id, line, expression, data$ as Subject<LineData>)
  );
}

function clearAnnotations() {
  annotations.forEach((a) => a.dispose());
  annotations = [];
}

export { createAnnotations, clearAnnotations };
