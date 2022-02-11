"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryDecoration = void 0;
const vscode = require("vscode");
class QueryDecoration {
    constructor(lineNumber, activeEditor) {
        this.lineNumber = lineNumber;
        if (!activeEditor)
            throw new Error('No active editor selected');
        this.activeEditor = activeEditor;
        this.line = lineNumber;
        this.active = false;
        this.contentText = 'undefined';
        this.render();
    }
    show(contentText) {
        this.contentText = contentText;
        this.active = true;
        this.render();
    }
    clear() {
        if (this.decoration) {
            this.decoration.dispose();
        }
    }
    createDecoration() {
        let color = 'grey';
        if (this.active)
            color = 'green';
        return vscode.window.createTextEditorDecorationType({
            after: {
                contentText: this.contentText,
                margin: '20px',
                // backgroundColor: 'red',
                color,
            },
        });
    }
    render() {
        if (this.decoration) {
            this.clear();
        }
        // end of line
        const end = this.activeEditor.document.lineAt(this.line - 1).range.end
            .character;
        const range = new vscode.Range(new vscode.Position(this.line - 1, end), new vscode.Position(this.line - 1, end));
        this.decoration = this.createDecoration();
        this.activeEditor.setDecorations(this.decoration, [{ range }]);
    }
}
exports.QueryDecoration = QueryDecoration;
//# sourceMappingURL=decoration.js.map