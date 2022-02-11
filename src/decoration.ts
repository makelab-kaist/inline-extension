import * as vscode from 'vscode';

class QueryDecoration {
  decoration?: vscode.TextEditorDecorationType;
  activeEditor: vscode.TextEditor;
  line: number;
  active: boolean;
  contentText: string;

  constructor(public lineNumber: number, activeEditor: vscode.TextEditor) {
    if (!activeEditor) throw new Error('No active editor selected');
    this.activeEditor = activeEditor;
    this.line = lineNumber;

    this.active = false;
    this.contentText = 'undefined';
    this.render();
  }

  show(contentText: string) {
    this.contentText = contentText;
    this.active = true;
    this.render();
  }

  clear() {
    if (this.decoration) {
      this.decoration.dispose();
    }
  }

  private createDecoration(): vscode.TextEditorDecorationType {
    let color = 'grey';
    if (this.active) color = 'green';

    return vscode.window.createTextEditorDecorationType({
      after: {
        contentText: this.contentText,
        margin: '20px',
        // backgroundColor: 'red',
        color,
      },
    });
  }

  private render() {
    if (this.decoration) {
      this.clear();
    }

    // end of line
    const end = this.activeEditor.document.lineAt(this.line - 1).range.end
      .character;

    const range = new vscode.Range(
      new vscode.Position(this.line - 1, end),
      new vscode.Position(this.line - 1, end)
    );

    this.decoration = this.createDecoration();
    this.activeEditor.setDecorations(this.decoration, [{ range }]);
  }
}

export { QueryDecoration };
