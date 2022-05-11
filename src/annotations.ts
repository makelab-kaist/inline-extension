import * as vscode from 'vscode';

type Annotation = {
  contentText: string;
  color?: string;
  backgroundColor?: string;
};

const annotations: Map<String, vscode.TextEditorDecorationType> = new Map();
const HIGHLIGH_COLOR = 'yellow';

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
      color,
      backgroundColor,
      margin: '20px',
    },
  });

  const range = lineToRange(line);
  activeEditor?.setDecorations(decorator, [{ range }]);
  return decorator;
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
}

function updateAnnotation(
  id: string,
  line: number,
  annotation: Annotation,
  timeout: number = 500
) {
  if (!annotations.has(id)) {
    // annotaiton does not exist. Exit
    return;
  }

  const curr = annotations.get(id)!;
  curr.dispose();

  // flashing highlight if timeout if > 0
  if (timeout > 0) {
    const highlight = createDecoration(
      line,
      annotation.contentText,
      HIGHLIGH_COLOR
    );

    setTimeout(() => {
      highlight.dispose();
      const decoration = createDecoration(
        line,
        annotation.contentText,
        annotation.color,
        annotation.backgroundColor
      );
      annotations.set(id, decoration);
    }, timeout);
  } else {
    const decoration = createDecoration(
      line,
      annotation.contentText,
      annotation.color,
      annotation.backgroundColor
    );
    annotations.set(id, decoration);
  }
}

export {
  addAnnotation,
  updateAnnotation,
  removeAllAnnotations,
  removeAnnotation,
};
