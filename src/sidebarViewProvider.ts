import * as vscode from 'vscode';
import {
  configureConnection,
  connectSerial,
  disconnectSerial,
  compileAndUpload,
  decorateEditor,
  removeAnnotationsFromCode,
  toggleHighlight,
  compileAndUploadRelease,
} from './extension';

type Message = {
  message: string;
  [key: string]: string | boolean;
};

class SideViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'double-cheese.view';

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(
      ({ message }: { message: string }) => {
        switch (message) {
          case 'configureConnection':
            configureConnection();
            break;
          case 'connectSerial':
            connectSerial();
            break;
          case 'disconnectSerial':
            disconnectSerial();
            break;
          case 'uploadSketch':
            compileAndUpload();
            break;
          case 'uploadRelease':
            compileAndUploadRelease();
            break;
          case 'refreshAnnotations':
            decorateEditor();
            break;
          case 'clearAnnotations':
            removeAnnotationsFromCode();
            break;
          case 'toggleHighlight':
            toggleHighlight();
            break;

          default: /* none */
            break;
        }
      }
    );
  }

  public sendMessage(msg: Message) {
    if (this._view) {
      this._view.webview.postMessage(msg);
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const bundleScript = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        'side_view_public',
        'build',
        'bundle.js'
      )
    );
    const bundlecss = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        'side_view_public',
        'build',
        'bundle.css'
      )
    );
    const globalcss = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'side_view_public', 'global.css')
    );

    const nonce = getNonce();
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset='utf-8'>
        <meta name='viewport' content='width=device-width,initial-scale=1'>
        <!---
        <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; img-src ${webview.cspSource} 
        https:; script-src ${webview.cspSource}; style-src ${webview.cspSource};"/>
        -->
        
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; 
        script-src 'nonce-${nonce}';">

        <link rel='stylesheet' href='${globalcss}'>
        <link rel='stylesheet' href='${bundlecss}'>
      
        <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        </script>
        <script defer nonce="${nonce}" src='${bundleScript}'></script>
      
      </head>

      <body>
      </body>
      </html>`;
  }
}

function getNonce() {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export { SideViewProvider };
