import * as vscode from 'vscode';
import { data$ } from './extension';
import { CodeManager, CodeQuery } from './codeManager';
import { Decoration } from './decoration';

let value = 0;
// let decorations: Decoration[];
let annotations: Map<String, Decoration> = new Map();

function annotate() {
  const queries = CodeManager.getInstance().getCodeQueries();
  annotations = new Map(queries.map((q) => [q.id, new Decoration(q.line)]));

  data$.subscribe((data: any) => {
    const { id, line, values } = data;
    annotations.get(id)?.decorate('' + values, 'DodgerBlue', 'none');
  });
}

export { annotate };
