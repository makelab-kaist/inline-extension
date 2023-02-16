import { data$, LiveData } from './extension';
import { CodeManager, ExpressionQuery } from './codeManager';
import { filter, Subject, Subscription, tap, map } from 'rxjs';
import {
  Decoration,
  HighlightDecoration,
  TextDecoration,
  WebViewDecoration,
  P5ViewDecoration,
} from './decorations';
import { ExpressionEngine, ExpressionResult } from './expressions';
import { loadavg } from 'os';
import { transpileExpression } from './parser';

// Globals
let annotations: Annotation[] = [];
let highlightOn: boolean = true;

// Annotation class

class Annotation {
  private sub: Subscription;
  private highlightDec: Decoration;
  private textDec: Decoration;
  // private wv: P5ViewDecoration;

  constructor(
    private id: string,
    private line: number,
    private expression: string,
    data$: Subject<LiveData>
  ) {
    // Create decorators for line and for text
    this.highlightDec = new HighlightDecoration(line);
    this.textDec = new TextDecoration(line);
    this.textDec.decorate({
      contentText: 'None',
    });
    // this.wv = new P5ViewDecoration(line);
    // this.wv.decorate('<h1>Hi</h1><p>asdf</p>');
    // this.wv.decorate();

    // Filted and subscribe
    this.sub = data$
      .pipe(
        filter((d) => id === d.id), // filter by id
        map(({ values }) => values[0]) // get only the first element from arduino
      )
      .subscribe((lineValue: string) => {
        try {
          // parsing
          let expressionToEvaluate = this.parseExpression(
            expression,
            lineValue
          );

          // executing
          let resultToShow =
            ExpressionEngine.getInstance().evalExpression(expressionToEvaluate);

          // Update decorations
          this.updateDecorations(resultToShow);
        } catch (err: any) {
          this.textDec.decorate({
            contentText: err.message,
            color: 'red',
          });
          return; // nothing to evaluate
        }

        // Evaluate the expression and compute the result
      });
  }

  dispose() {
    this.highlightDec.dispose();
    this.textDec.dispose();
    // this.wv.dispose();
    this.sub?.unsubscribe();
  }

  // Private helpers
  private parseExpression(
    expression: string,
    lineValue: string
  ): string | never {
    let result = '';
    try {
      // parse the expression and run it
      result = transpileExpression(expression);
      result = this.variableSubstituions(result, lineValue);
    } catch (err: any) {
      throw new Error('Invalid expression: unable to parse');
    }
    return result;
  }

  private variableSubstituions(expression: string, current: string): string {
    // $$ means the value we get from the arduino (current)
    let expr = expression.replaceAll('$$', current);
    // all user variables ($) are translated in `this.`
    // $a => this.a
    return expr.replaceAll('$', 'this.');
  }

  private updateDecorations(resultToShow: ExpressionResult) {
    if (resultToShow.outputFormat === 'inline') {
      this.textDec.decorate({
        contentText: `${resultToShow.stringValue}` || 'None',
        color: 'DodgerBlue',
      });
    }
    if (highlightOn) this.highlightDec.decorate(500);
  }
}

// Annotations main control

// id, line, values_on_line, expression, decoration
export function createAnnotations() {
  const queries = CodeManager.getInstance().getExpressionQueries();

  // if they exist, remove them
  if (isAnyAnnotation()) clearAnnotations();

  annotations = queries.map(
    ({ id, line, expression }: ExpressionQuery) =>
      new Annotation(id, line, expression, data$)
  );
}

function isAnyAnnotation() {
  return annotations.length > 0;
}

export function clearAnnotations() {
  annotations.forEach((a) => a.dispose());
  annotations = [];
}

export function toggleAnnotationsHighlight(): boolean {
  highlightOn = !highlightOn;
  return highlightOn;
}
