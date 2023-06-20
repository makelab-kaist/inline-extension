/**
 * Annotation class and function to create and remote them
 */
import { data$, LiveData } from './extension';
import { CodeManager, ExpressionQuery } from './codeManager';
import { filter, Subject, Subscription, tap, map } from 'rxjs';
import {
  Decoration,
  HighlightDecoration,
  TextDecoration,
  broadcastToWebviews,
  GraphDecoration,
} from './decorations';
import { ExpressionEngine, ExpressionResult } from './expressions';
import { transpileExpression } from './parser';

// Globals
let annotations: Annotation[] = [];
let highlightOn: boolean = true;

// Annotations main control functions

// Create annotations from the code queries
export function createAnnotations() {
  const queries = CodeManager.getInstance().getExpressionQueries();

  // if they exist, remove them
  if (isAnyAnnotation()) clearAnnotations();

  annotations = queries.map(
    ({ id, line, expression }: ExpressionQuery) =>
      new Annotation(id, line, expression, data$)
  );
  // clearing the context of expression everytime we refresh
  ExpressionEngine.getInstance().clear();
}

// Check whether there is any annotation active
function isAnyAnnotation() {
  return annotations.length > 0;
}

// Clear up all annotations
export function clearAnnotations() {
  annotations.forEach((a) => a.dispose());
  annotations = [];
}

// Toggle the annotation highlight globally
export function toggleAnnotationsHighlight(): boolean {
  highlightOn = !highlightOn;
  return highlightOn;
}

// The Annotation class

class Annotation {
  private sub: Subscription;
  private highlightDec: Decoration;
  private textDec: Decoration;
  private histogram: GraphDecoration;
  private linegraph: GraphDecoration;

  // Each annotation subscribes to its own Subject
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
    this.histogram = new GraphDecoration(line, id, 'histogram');
    this.linegraph = new GraphDecoration(line, id, 'linegraph');

    // Filted and subscribe
    this.sub = data$
      .pipe(
        filter((d) => line === d.line), // filter by id
        filter(({ values }) => values.length > 0)
      )
      .subscribe(({ id: receivedID, values: lineValues }) => {
        // if (receivedID !== id) {
        //   this.textDec.decorate({
        //     contentText: 'Reload required',
        //     color: 'red',
        //   });
        //   return;
        // }

        try {
          let resultToShow: any = {
            stringValue: 'Reload required',
            outputFormat: 'inline' as const,
            value: [],
          };

          // Line still valid? then compute the result to show
          if (receivedID === id) {
            // parsing
            let expressionToEvaluate = this.parseExpression(
              expression,
              lineValues
            );
            // console.log(expressionToEvaluate, expression, lineValues);

            // executing
            resultToShow =
              ExpressionEngine.getInstance().evalExpression(
                expressionToEvaluate
              );
          }

          // update decorations
          this.updateDecorations(resultToShow);

          // broadcast to the graphs
          broadcastToWebviews(id, resultToShow);
        } catch (err: any) {
          this.textDec.decorate({
            contentText: err.message,
            color: 'red',
          });
          return; // nothing to evaluate
        }
      });
  }

  // Clean up all decorators associated
  dispose() {
    this.textDec.dispose();
    this.highlightDec?.dispose();
    this.histogram?.dispose();
    this.linegraph?.dispose();
    this.sub?.unsubscribe();
  }

  // Private helpers

  // Parse an expression
  private parseExpression(
    expression: string,
    lineValues: string[]
  ): string | never {
    let result = '';
    try {
      // parse the expression and run it
      result = transpileExpression(expression);
    } catch (err: any) {
      console.error(err);
      throw new Error('Invalid expression: unable to parse');
    }

    // run the expression (might throw an error)
    result = this.variableSubstitutions(result, lineValues);

    return result;
  }

  // Run eval in the context for the expression
  private variableSubstitutions(
    expression: string,
    current: string[]
  ): string | never {
    // $$ means the value we get from the arduino (current)
    let expr = expression.replaceAll('$$', current[0]); // I know at least one exists

    // $0, $1... get and then replace all expressions that have value like $[number]
    const regexp = /\$\d+/g;
    const substitutions = expr.matchAll(regexp);
    for (let s of substitutions) {
      const text = s.toString();
      const index = parseInt(text.substring(1)); // extract number from $number => number
      const value = current[index];
      if (value === undefined) throw new Error(`$${index} does not exist`);
      expr = expr.replace(text, value);
    }

    // all user variables ($) are translated in `this.`
    // $a => this.a
    return expr.replaceAll('$', 'this.');
  }

  // Update the decorators
  private updateDecorations(resultToShow: ExpressionResult) {
    // inline : if (resultToShow.outputFormat === 'inline')
    // we update the line anywa
    this.textDec.decorate({
      contentText: `${resultToShow.stringValue}` || 'None',
      color: 'DodgerBlue',
    });
    // Plot
    if (resultToShow.outputFormat === 'histogram') {
      this.histogram.decorate();
    }
    if (resultToShow.outputFormat === 'linegraph') {
      this.linegraph.decorate();
    }
    // highlight
    if (highlightOn) this.highlightDec.decorate(500);
  }
}
