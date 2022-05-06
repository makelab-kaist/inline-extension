import * as vscode from 'vscode';

type Annotation = {
  id: string;
  line: number;
  value: string;
  decorator: vscode.TextEditorDecorationType;
};

const annotations: Map<String, Annotation> = new Map();

function createDecoration(
  contentText: string,
  color = 'green',
  backgroundColor = 'none'
): vscode.TextEditorDecorationType {
  return vscode.window.createTextEditorDecorationType({
    after: {
      contentText,
      color,
      backgroundColor,
      margin: '20px',
    },
  });
}

function removeDecoration(id: string) {
  const annotation = annotations.get(id)!;
  annotation.decorator.dispose();
  annotations.delete(id);
}

function createAnnotation(id: string, line: number, value: string = 'NaN') {
  if (annotations.has(id)) {
    removeDecoration(id); // remove if already exists
  }
  // crate a new annotation

  let color = 'green';
  if (value === 'NaN') {
    color = 'grey';
  }
  const annotation = {
    id,
    line,
    value,
    decorator: createDecoration(value, color),
  };

  annotations.set(id, annotation);

  // show it
  const end = 10000; // a large number
  const range = new vscode.Range(
    new vscode.Position(line - 1, end), // lines starts at 0
    new vscode.Position(line - 1, end) // lines start at 0
  );

  const activeEditor = vscode.window.activeTextEditor;
  activeEditor?.setDecorations(annotation.decorator, [{ range }]);
}

function removeAnnotations() {
  annotations.forEach(({ decorator }) => decorator.dispose());
  annotations.clear();
}

export { createAnnotation, removeAnnotations };
