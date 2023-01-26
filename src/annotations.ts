import * as vscode from 'vscode';
import { data$ } from './extension';
import { CodeManager } from './codeManager';

let value = 0;
let d: Decoration;

const LINE_HIGHLIGHT = vscode.window.createTextEditorDecorationType({
  isWholeLine: true,
  backgroundColor: 'rgb(205, 187, 8)',
});

function annotate() {
  // data$.subscribe((data: any) => {
  //   const { id, line, values } = data;
  // });
  // d = new Decoration(9);
  // setInterval(() => {
  //   value += 1;
  //   d.decorate('' + value, 'red', 'white');
  // }, 1000);
}

class Decoration {
  private _line!: number;
  private _decorator!: vscode.TextEditorDecorationType;

  constructor(line: number) {
    this._line = line;
  }

  decorate(contentText: string, color: string, backgroundColor: string) {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) return;

    if (this._decorator) this.clear();
    if (this._decorator) this._decorator.dispose();

    this._decorator = vscode.window.createTextEditorDecorationType({
      after: {
        contentText,
        color: color,
        backgroundColor,
        margin: '20px',
      },
    });

    const range = this.lineToRange(this._line);
    activeEditor?.setDecorations(this._decorator, [{ range }]);
    this.highlightLine(this._line);
    setTimeout(this.removeHighlightLine, 500);
  }

  clear() {
    if (this._decorator) this._decorator.dispose();
  }

  private highlightLine(line: number) {
    const activeEditor = vscode.window.activeTextEditor;
    activeEditor?.setDecorations(LINE_HIGHLIGHT, [
      { range: this.lineToRange(line) },
    ]);
  }

  private removeHighlightLine() {
    const activeEditor = vscode.window.activeTextEditor;
    activeEditor?.setDecorations(LINE_HIGHLIGHT, []);
  }

  private lineToRange(line: number): vscode.Range {
    const end = 10000; // a large number
    const range = new vscode.Range(
      new vscode.Position(line - 1, end), // lines starts at 0
      new vscode.Position(line - 1, end) // lines start at 0
    );
    return range;
  }

  // function removeAnnotation(id: string) {
  //   if (annotations.has(id)) {
  //     const { decoration } = annotations.get(id)!;
  //     decoration.dispose();
  //     annotations.delete(id);
  //   }
  // }
}

export { annotate };
