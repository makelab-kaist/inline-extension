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
import { ExpressionEngine } from './expressions';

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
    // this.wv.decorate();

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
        // this.highlightDec.decorate(500);
        // this.textDec.decorate({
        //   contentText: `${value}`,
        //   color,
        // });
        // this.wv.update(values[0]);
      });
  }

  dispose() {
    this.highlightDec.dispose();
    this.textDec.dispose();
    this.sub?.unsubscribe();
    this.wv.dispose();
  }
}

///////

let annotations: Annotation[] = [];

// id, line, values_on_line, expression, decoration
export function createAnnotations() {
  const queries = CodeManager.getInstance().getCodeQueries();

  // if they exist, remove them
  if (isAnyAnnotation()) clearAnnotations();

  annotations = queries.map(
    ({ id, line, expression }: CodeQuery) =>
      new Annotation(id, line, expression, data$ as Subject<LineData>)
  );
}

function isAnyAnnotation() {
  return annotations.length > 0;
}

export function clearAnnotations() {
  annotations.forEach((a) => a.dispose());
  annotations = [];
}
