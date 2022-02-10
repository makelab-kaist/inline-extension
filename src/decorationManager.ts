import * as vscode from 'vscode';
import * as parser from './parser';

const decorations = {
  functionHighlight: vscode.window.createTextEditorDecorationType({
    border: '1px solid green',
  }),
};

class DecorationManager {
  private static instance: DecorationManager;

  private queryDecorations: Map<string, vscode.Disposable[]> = new Map();

  private constructor() {}

  static getInstance() {
    if (!DecorationManager.instance) this.instance = new DecorationManager();
    return this.instance;
  }

  updateQueryList(queries: parser.LineData[]) {
    this.queryDecorations = new Map();
    // queries.forEach(({ id, line, data }) => {});
  }

  setDecoration(id: string, value: string) {}

  /*
  this.addDecorationWithText(
      '▶️ ' + text,
      annotation.location.line - 1,
      annotation.location.endCol,
      editor
    );
  */

  // decorateFunctions(ranges: vscode.Range[]) {
  //   vscode.window.activeTextEditor?.setDecorations(
  //     decorations.functionHighlight,
  //     ranges
  //   );
  // }

  // private removeDecorations() {
  //   if (this.disposables) {
  //     this.disposables.forEach((item) => item.dispose());
  //   }
  //   this.disposables = [];
  // }
}

export { DecorationManager };
