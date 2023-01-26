import * as vscode from 'vscode';

class Decoration {
  private line!: number;
  private decorator!: vscode.TextEditorDecorationType;
  private highlight: vscode.TextEditorDecorationType;

  private defaultColor = 'grey';
  private defaultBg = 'none';

  constructor(line: number) {
    this.line = line;

    this.highlight = vscode.window.createTextEditorDecorationType({
      isWholeLine: true,
      backgroundColor: 'rgb(205, 187, 8)',
    });
  }

  decorate(
    contentText: string,
    color: string | undefined = undefined,
    backgroundColor: string | undefined = undefined
  ) {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) return;

    if (this.decorator) this.clear();

    this.decorator = vscode.window.createTextEditorDecorationType({
      after: {
        contentText,
        color: color || this.defaultColor,
        backgroundColor: backgroundColor || this.defaultBg,
        margin: '20px',
      },
    });

    const range = this.lineToRange(this.line);
    activeEditor?.setDecorations(this.decorator, [{ range }]);
    this.highlightLine(this.line);
    setTimeout(this.removeHighlightLine.bind(this), 500);
  }

  clear() {
    if (this.decorator) this.decorator.dispose();
    this.removeHighlightLine();
  }

  private highlightLine(line: number) {
    const activeEditor = vscode.window.activeTextEditor;
    activeEditor?.setDecorations(this.highlight, [
      { range: this.lineToRange(line) },
    ]);
  }

  private removeHighlightLine() {
    const activeEditor = vscode.window.activeTextEditor;
    activeEditor?.setDecorations(this.highlight, []);
  }

  private lineToRange(line: number): vscode.Range {
    const end = 10000; // a large number
    const range = new vscode.Range(
      new vscode.Position(line - 1, end), // lines starts at 0
      new vscode.Position(line - 1, end) // lines start at 0
    );
    return range;
  }
}

export { Decoration };
