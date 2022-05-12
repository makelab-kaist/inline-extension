import * as vscode from 'vscode';

type Annotation = {
  contentText: string;
  color?: string;
  backgroundColor?: string;
};

const LINE_HIGHLIGHT = vscode.window.createTextEditorDecorationType({
  isWholeLine: true,
  backgroundColor: 'rgb(205, 187, 8)',
});

const annotations: Map<String, vscode.TextEditorDecorationType> = new Map();

function addAnnotation(id: string, line: number, annotation: Annotation) {
  if (annotations.has(id)) {
    throw new Error(`Annotation ${id} already existing`);
  }

  const decoration = createDecoration(line, annotation.contentText);
  annotations.set(id, decoration);
}

function createDecoration(
  line: number,
  contentText: string,
  color: string = 'grey',
  backgroundColor: string = 'none'
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
    const decorator = annotations.get(id)!;
    decorator.dispose();
    annotations.delete(id);
  }
}

function removeAllAnnotations() {
  annotations.forEach((decorator) => decorator.dispose());
  annotations.clear();
  removeHighlightLine();
}

function updateAnnotation(id: string, line: number, annotation: Annotation) {
  if (!annotations.has(id)) {
    // annotaiton does not exist. Exit
    return;
  }

  highlightLine(line);
  const curr = annotations.get(id)!;
  curr.dispose();

  const decoration = createDecoration(
    line,
    annotation.contentText,
    annotation.color,
    annotation.backgroundColor
  );
  annotations.set(id, decoration);
}

function evaluateExpression(expression: string, values: string[]) {
  let substituion = expression.replace(/\$[0-9]/gi, function (x: string) {
    const index = parseInt(x.slice(1));
    return values[index];
  });
  try {
    return `${eval(substituion)}`;
  } catch (err) {
    return '';
  }
}

export {
  addAnnotation,
  updateAnnotation,
  removeAllAnnotations,
  removeAnnotation,
};
