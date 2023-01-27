import { data$, LineData } from './extension';
import { CodeManager, CodeQuery } from './codeManager';
import { filter, Subject, Subscription, tap } from 'rxjs';
import { Decoration, HighlightDecoration, TextDecoration } from './decoration';

class Annotation {
  private sub: Subscription;
  private highlightDec: Decoration;
  private textDec: Decoration;

  constructor(
    private id: string,
    private line: number,
    data$: Subject<LineData>
  ) {
    // Create decorators for line and for text
    this.highlightDec = new HighlightDecoration(line);
    this.textDec = new TextDecoration(line);
    this.textDec.decorate({
      contentText: 'None',
    });

    this.sub = data$
      .pipe(filter((d) => id === d.id))
      .subscribe(({ id, line, values }: LineData) => {
        // Update decorations
        this.highlightDec.decorate(500);
        this.textDec.decorate({
          contentText: values.join(','),
          color: 'DodgerBlue',
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
let expressionContext = {};

// id, line, values_on_line, expression, decoration
function updateAnnotations() {
  const queries = CodeManager.getInstance().getCodeQueries();

  // if they exist, remove them
  if (annotations.length > 0) clearAnnotations();

  annotations = queries.map(
    ({ id, line, expression }: CodeQuery) =>
      new Annotation(id, line, data$ as Subject<LineData>)
  );
}

function clearAnnotations() {
  annotations.forEach((a) => a.dispose());
  annotations = [];
  expressionContext = {};
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
