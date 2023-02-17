import * as vscode from 'vscode';
import { getExtensionUri } from './extension';
import { Server } from 'socket.io';

const PORT = 3300;
const webviewServer = new Server(PORT, { cors: { origin: '*' } });

webviewServer.on('connection', function (socket) {
  // console.log('connected');
});

export function update(id: string, value: any[]) {
  webviewServer?.emit('data', {
    id,
    value,
  });
}

abstract class Decoration {
  constructor(protected line: number) {}

  abstract decorate(params: any): void;
  abstract dispose(): void;

  // Internals:
  // Convert line number to suitable vscode range
  protected lineToRange(line: number): vscode.Range {
    const end = 10000; // a large number
    const range = new vscode.Range(
      new vscode.Position(line - 1, end), // lines starts at 0
      new vscode.Position(line - 1, end) // lines start at 0
    );
    return range;
  }

  // Get current active editor (should be a .ino file)
  protected getActiveEditor() {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor?.document.fileName.endsWith('ino')) return activeEditor;
    //else
    return undefined;
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
    const activeEditor = this.getActiveEditor();
    activeEditor?.setDecorations(this.highlight, [
      { range: this.lineToRange(line) },
    ]);
  }

  private removeHighlightLine() {
    const activeEditor = this.getActiveEditor();
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
    const activeEditor = this.getActiveEditor();
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

class WebViewDecoration extends Decoration {
  private inset!: vscode.WebviewEditorInset;

  constructor(line: number) {
    super(line);
  }

  decorate(htmlBody: string): void {
    const activeEditor = this.getActiveEditor();
    if (!activeEditor) return;
    // const rootUrl = vscode.Uri.file(context.extensionPath);

    this.inset = vscode.window.createWebviewTextEditorInset(
      activeEditor,
      this.line + 1,
      10,
      { localResourceRoots: [], enableScripts: true }
    );
    if (this.inset)
      this.inset.webview.html = `
		<style>
		h1{
			background: red;
		}
		</style>
		${htmlBody}`;
  }

  dispose(): void {
    this.inset?.dispose();
  }
}

class GraphDecoration extends Decoration {
  private inset!: vscode.WebviewEditorInset;
  private root: vscode.Uri;
  private ready: boolean = false;

  constructor(line: number, private graphType: 'histogram' | 'linegraph') {
    super(line);
    this.root = getExtensionUri();
  }

  decorate(): void {
    if (this.ready) return;
    this.ready = true;

    const activeEditor = this.getActiveEditor();
    if (!activeEditor) return;

    this.inset = vscode.window.createWebviewTextEditorInset(
      activeEditor,
      this.line - 1, // just below the marker
      6,
      { localResourceRoots: [this.root], enableScripts: true }
    );

    const p5lib = this.inset.webview.asWebviewUri(
      vscode.Uri.joinPath(this.root, 'src/graphs/p5.js')
    );
    const iolib = this.inset.webview.asWebviewUri(
      vscode.Uri.joinPath(this.root, 'src/graphs/socket.io.min.js')
    );
    const code = this.inset.webview.asWebviewUri(
      vscode.Uri.joinPath(this.root, `src/graphs/${this.graphType}.js`)
    );

    if (this.inset)
      this.inset.webview.html = `
        <head>
        <script src="${p5lib}"></script>
        <script src="${iolib}"></script>
        <style>
        body {
          margin-top: 1%;
        }
        </style>
        </head>
        <body>  
        <script defer  src="${code}"></script>
        </body>
        `;
  }

  dispose(): void {
    this.inset?.dispose();
  }
}

export {
  Decoration,
  HighlightDecoration,
  TextDecoration,
  WebViewDecoration,
  GraphDecoration,
};
