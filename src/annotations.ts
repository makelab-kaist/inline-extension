import * as vscode from 'vscode';
import { data$ } from './extension';
import { CodeManager, CodeQuery } from './codeManager';
import { Decoration } from './decoration';

type Annotation = {
  expression: string;
  decoration: Decoration;
};

let annotations: Map<String, Annotation> = new Map();

let globalContext = {
  val: 1,
  test: function () {
    return this.val;
  },
};

function hello() {
  return 'world';
}

function evalInContext(this: any, expression: string) {
  if (!expression) return;
  return eval(expression);
}

function updateAnnotations() {
  clearAnnotations();
  createAnnotations();
}

function createAnnotations() {
  const queries = CodeManager.getInstance().getCodeQueries();
  annotations = new Map(
    queries.map((q) => [
      q.id,
      <Annotation>{
        expression: q.expression,
        decoration: new Decoration(q.line),
      },
    ])
  );

  data$.subscribe((incomingData: any) => {
    const { id, line, values } = incomingData;
    const expression = annotations.get(id)?.expression || '';
    globalContext.val = line;
    const res = function (this: any) {
      if (!expression) return;
      return eval(expression);
    }.call(globalContext);

    annotations
      .get(id)
      ?.decoration.decorate(
        '' + expression + ', ' + values + ', ' + res,
        'DodgerBlue',
        'none'
      );
  });
}

function clearAnnotations() {
  annotations.forEach(({ decoration }) => decoration.clear());
  annotations.clear();
}

export { updateAnnotations };
