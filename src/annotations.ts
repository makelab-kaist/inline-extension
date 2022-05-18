import * as vscode from 'vscode';

type Annotation = {
  expressions: string[];
  line: number;
  decoration: vscode.TextEditorDecorationType;
  evaluatedValues?: string[];
  color: string;
  backgroundColor: string;
};

const LINE_HIGHLIGHT = vscode.window.createTextEditorDecorationType({
  isWholeLine: true,
  backgroundColor: 'rgb(205, 187, 8)',
});

const annotations: Map<String, Annotation> = new Map();

function addAnnotation(
  id: string,
  line: number,
  contentText: string,
  expressionText: string = '',
  color: string = 'grey',
  backgroundColor: string = 'none'
) {
  if (annotations.has(id)) {
    throw new Error(`Annotation ${id} already existing`);
  }

  const decoration = createDecoration(
    line,
    contentText,
    color,
    backgroundColor
  );

  const annotation = {
    expressions: expressionText.split(','),
    line,
    decoration,
    color,
    backgroundColor,
  };
  annotations.set(id, annotation);
}

function createDecoration(
  line: number,
  contentText: string,
  color: string,
  backgroundColor: string
): vscode.TextEditorDecorationType {
  const activeEditor = vscode.window.activeTextEditor;

  const decorator = vscode.window.createTextEditorDecorationType({
    after: {
      contentText,
      color: color,
      backgroundColor,
      margin: '20px',
    },
  });

  const range = lineToRange(line);
  activeEditor?.setDecorations(decorator, [{ range }]);
  return decorator;
}

function highlightLine(line: number) {
  const activeEditor = vscode.window.activeTextEditor;
  activeEditor?.setDecorations(LINE_HIGHLIGHT, [{ range: lineToRange(line) }]);
}

function removeHighlightLine() {
  const activeEditor = vscode.window.activeTextEditor;
  activeEditor?.setDecorations(LINE_HIGHLIGHT, []);
}

function lineToRange(line: number): vscode.Range {
  const end = 10000; // a large number
  const range = new vscode.Range(
    new vscode.Position(line - 1, end), // lines starts at 0
    new vscode.Position(line - 1, end) // lines start at 0
  );
  return range;
}

function removeAnnotation(id: string) {
  if (annotations.has(id)) {
    const { decoration } = annotations.get(id)!;
    decoration.dispose();
    annotations.delete(id);
  }
}

function removeAllAnnotations() {
  annotations.forEach(({ decoration }) => decoration.dispose());
  annotations.clear();
  removeHighlightLine();
}

function updateAnnotation(
  id: string,
  line: number,
  values: string[],
  highlight: boolean = true
) {
  if (!annotations.has(id)) {
    // annotaiton does not exist. Exit
    return;
  }
  // highlight the line
  if (highlight) highlightLine(line);

  // Replace the decorator
  const annotation = annotations.get(id)!;
  annotation.decoration?.dispose();

  // Text substitution
  const expressionsResults: string[] = [];
  for (const expr of annotation.expressions) {
    const substituion = parseExpression(expr, values);
    try {
      expressionsResults.push(`${eval(substituion)}`);
    } catch (err) {
      expressionsResults.push('"Invalid expression"');
    }
  }
  annotation.evaluatedValues = expressionsResults;

  // Update decoration
  const contentText = annotation.evaluatedValues.toString();

  annotation.decoration = createDecoration(
    line,
    contentText,
    annotation.color,
    annotation.backgroundColor
  );
}

function parseExpression(expression: string, values: string[]): string {
  if (expression === '') {
    return values.toString();
  }

  let substituion = expression.replace(/[\$@][0-9]+/gi, function (x: string) {
    const type = x.charAt(0); // $ or @
    const index = parseInt(x.slice(1));

    if (type === '$') {
      const res = values[index];
      if (!res) return `"${x} does not exist"`;
      return res;
    } else if (type === '@') {
      const prev = getAnnotationAtLine(index);
      if (!prev) return `"${x} is not a valid line"`;
      if (!prev.evaluatedValues) return `"${x} does not exist"`;
      return `"${prev.evaluatedValues}"`;
    }
    return '';
  });
  return substituion;
}

function getAnnotationAtLine(lineNumber: number) {
  return Array.from(annotations, (item) => item[1]).find(
    ({ line }) => line === lineNumber
  );
}

export {
  addAnnotation,
  updateAnnotation,
  removeAllAnnotations,
  removeAnnotation,
  removeHighlightLine,
};
