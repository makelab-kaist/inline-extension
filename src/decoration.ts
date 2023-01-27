import * as vscode from 'vscode';

abstract class Decoration {
  constructor(protected line: number) {}

  abstract decorate(params: any): void;
  abstract dispose(): void;

  protected lineToRange(line: number): vscode.Range {
    const end = 10000; // a large number
    const range = new vscode.Range(
      new vscode.Position(line - 1, end), // lines starts at 0
      new vscode.Position(line - 1, end) // lines start at 0
    );
    return range;
  }
}

class HighlightDecoration extends Decoration {
  private highlight: vscode.TextEditorDecorationType;

  constructor(line: number) {
    super(line);

    this.highlight = vscode.window.createTextEditorDecorationType({
      isWholeLine: true,
      backgroundColor: 'rgb(205, 187, 8)',
    });
  }

  decorate(duration: number) {
    this.highlightLine(this.line);
    setTimeout(this.removeHighlightLine.bind(this), duration);
  }

  dispose() {
    this.removeHighlightLine();
    this.highlight.dispose();
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
}

class TextDecoration extends Decoration {
  private textView!: vscode.TextEditorDecorationType;

  private defaultColor = 'grey';
  private defaultBg = 'none';

  constructor(line: number) {
    super(line);
  }

  decorate({
    contentText,
    color = 'grey',
    backgroundColor = 'none',
  }: {
    contentText: string;
    color: string;
    backgroundColor: string;
  }) {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) return;

    if (this.textView) this.dispose();

    this.textView = vscode.window.createTextEditorDecorationType({
      after: {
        contentText,
        color: color || this.defaultColor,
        backgroundColor: backgroundColor || this.defaultBg,
        margin: '20px',
      },
    });

    const range = this.lineToRange(this.line);
    activeEditor?.setDecorations(this.textView, [{ range }]);
  }

  dispose() {
    if (this.textView) this.textView.dispose();
  }
}

export { Decoration, HighlightDecoration, TextDecoration };
