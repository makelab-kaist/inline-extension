import * as vscode from 'vscode';
import { data$, LineData } from './extension';
import { CodeManager, CodeQuery } from './codeManager';
import { filter, Subject, Subscription, tap } from 'rxjs';
import { Decoration, HighlightDecoration, TextDecoration } from './decoration';
import { appendFile } from 'fs';
import { LowPassFilter } from './vendor/OneEuroFilter';

class Context {
  private fil!: LowPassFilter;
  private lastTime: number = 0;

  constructor() {
    this.fil = new LowPassFilter(1);
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
    const res = this.fil.filterWithAlpha(input, alpha);
    return res.toFixed(1);
  }
}

class ExpressionEngine {
  private static instance: ExpressionEngine;
  private context = new Context();

  static getInstance() {
    if (!ExpressionEngine.instance) this.instance = new ExpressionEngine();
    return this.instance;
  }

  evalInContext(expr: string) {
    const src = expr.replaceAll('$', 'this.');
    try {
      return new Function(`return eval('${src}')`).call(this.context);
      // return new Function(`return ${src}`).call(this.context);
    } catch (err) {
      throw new Error(`Invalid Expression: ${err}`);
    }
  }

  clear() {
    this.context = new Context();
  }
}

class Annotation {
  private sub: Subscription;
  private highlightDec: Decoration;
  private textDec: Decoration;

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

    // Filted and subscribe
    this.sub = data$
      .pipe(filter((d) => id === d.id))
      .subscribe(({ values }: LineData) => {
        // Compute the result
        // const result = this.evalInContext(expression, expressionContext);
        // console.log(`"${expression}"`, expressionContext, result);
        let expr = expression.replaceAll('$$', values[0]);
        let res: string = '';
        let color: string = 'DodgerBlue';

        try {
          res = ExpressionEngine.getInstance().evalInContext(expr);
          if (!res) {
            color = 'grey';
            res = 'None';
          }
        } catch (err: any) {
          color = 'red';
          res = err as string;
        }

        // Update decorations
        this.highlightDec.decorate(500);
        this.textDec.decorate({
          contentText: `${res}`,
          color,
        });
      });
  }

  dispose() {
    this.highlightDec.dispose();
    this.textDec.dispose();
    this.sub?.unsubscribe();
  }

  private evalInContext(src: string, ctx: any) {
    return eval(new Function(...Object.keys(ctx), src)(...Object.values(ctx)));
  }
}

///////

let annotations: Annotation[] = [];

// id, line, values_on_line, expression, decoration
function updateAnnotations() {
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
  // expressionContext = {};
}

// import { CodeManager, CodeQuery } from './codeManager';
// import { Decoration } from './decoration';

// type Annotation = {
//   expression: string;
//   decoration: Decoration;
// };

// let annotations: Map<String, Annotation> = new Map();

// function updateAnnotations() {
//   clearAnnotations();
//   createAnnotations();
// }

// function createAnnotations() {
//   const queries = CodeManager.getInstance().getCodeQueries();
//   annotations = new Map(
//     queries.map((q) => [
//       q.id,
//       <Annotation>{
//         expression: q.expression,
//         decoration: new Decoration(q.line),
//       },
//     ])
//   );

//   data$.subscribe((incomingData: any) => {
//     const { id, line, values } = incomingData;
//     const expression = annotations.get(id)?.expression || '';
//     globalContext.val = line;
//     const res = function (this: any) {
//       if (!expression) return;
//       return eval(expression);
//     }.call(globalContext);

//     annotations
//       .get(id)
//       ?.decoration.decorate(
//         '' + expression + ', ' + values + ', ' + res,
//         'DodgerBlue',
//         'none'
//       );
//   });
// }

export { updateAnnotations as createAnnotations, clearAnnotations };
