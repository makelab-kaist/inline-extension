import { data$, LineData } from './extension';
import { CodeManager, CodeQuery } from './codeManager';
import { filter, Subject, Subscription, tap } from 'rxjs';
import { Decoration, HighlightDecoration, TextDecoration } from './decoration';
import { OneEuroFilter } from './1euro';

class ExpressionEngine {
  private static instance: ExpressionEngine;
  private context = {
    assert(exp: boolean) {
      return exp ? '🟢' : '🔴';
    },
    above(v: number, threshold: number) {
      return v > threshold ? v : undefined;
    },
    below(v: number, threshold: number) {
      return v < threshold ? v : undefined;
    },
    between(v: number, low: number, high: number) {
      return v >= low && v <= high ? v : undefined;
    },
  };

  static getInstance() {
    if (!ExpressionEngine.instance) this.instance = new ExpressionEngine();
    return this.instance;
  }

  evalInContext(expr: string) {
    const src = expr.replaceAll('$', 'this.');
    try {
      return new Function(`return eval("${src}")`).call(this.context);
    } catch (err) {
      return `Invalid Expression: ${err}`;
    }
    // return new Function(`return ${src}`).call(this.context);
  }

  clear() {
    // this.context = {};
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

        const res = ExpressionEngine.getInstance().evalInContext(expr);

        // Update decorations
        this.highlightDec.decorate(500);
        this.textDec.decorate({
          contentText: `${res}`,
          color: res ? 'DodgerBlue' : 'red',
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
