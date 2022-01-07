import * as vscode from 'vscode';
import * as parser from './parser';

class AnnotationManager {
  private static instance: AnnotationManager;
  private annotations: parser.Annotation[] = [];
  private disposables: vscode.Disposable[] = [];

  private constructor() {}

  static getInstance() {
    if (!AnnotationManager.instance) this.instance = new AnnotationManager();
    return this.instance;
  }

  updateAnnotations() {
    // Get current Code
    const doc = vscode.window.activeTextEditor?.document;
    if (!doc || doc.isUntitled) {
      throw new Error('No valid document open');
    }
    const code = doc.getText();

    this.annotations = parser.getAnnotations(code);
  }

  displayAnnotations(serialData: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    // Chop data and validate
    const data: string[] = serialData.split(',');
    if (data.length === 0) return;
    const valid = data.shift() === '$'; // line should start with
    if (!valid) return;

    // line number and data
    const line = parseInt(data.shift()!);

    // display annotation
    // For simplicity here
    const annotation = this.annotations.find((a) => a.location.line === line);
    if (!annotation) return;

    const text = data.join(' ');
    // this.showText(text, annotation.location);
    console.log(serialData);

    this.addDecorationWithText(
      '▶️ ' + text,
      annotation.location.line - 1,
      annotation.location.endCol,
      editor
    );
  }

  private addDecorationWithText(
    contentText: string,
    line: number,
    column: number,
    activeEditor: vscode.TextEditor
  ) {
    this.removeDecorations();
    const decorationType = vscode.window.createTextEditorDecorationType({
      after: {
        contentText,
        margin: '50px',
        backgroundColor: 'red',
        color: 'white',
      },
    });

    this.disposables.push(decorationType);

    const range = new vscode.Range(
      new vscode.Position(line, column),
      new vscode.Position(line, column)
    );

    activeEditor.setDecorations(decorationType, [{ range }]);
  }

  private removeDecorations() {
    if (this.disposables) {
      this.disposables.forEach((item) => item.dispose());
    }
    this.disposables = [];
  }
}

export { AnnotationManager };
