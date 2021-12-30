"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnotationManager = void 0;
const vscode = require("vscode");
const parser = require("./parser");
class AnnotationManager {
    constructor() {
        this.annotations = [];
    }
    static getInstance() {
        if (!AnnotationManager.instance)
            this.instance = new AnnotationManager();
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
    displayAnnotations(serialData) {
        // Chop data and validate
        const data = serialData.split(',');
        if (data.length === 0)
            return;
        const valid = data.shift() === '$'; // line should start with
        if (!valid)
            return;
        // line number and data
        const line = parseInt(data.shift());
        // display annotation
        // For simplicity here
        const annotation = this.annotations.find((a) => a.location.line === line);
        if (!annotation)
            return;
        const text = ' ' + data.join(' ');
        this.showText(text, annotation.location);
        console.log(serialData);
    }
    showText(text, location) {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !text)
            return;
        const line = location.line - 1;
        const linelength = editor.document.lineAt(line).text.length;
        const range = new vscode.Range(new vscode.Position(line, location.endCol), new vscode.Position(line, linelength));
        editor.edit((editBuilder) => {
            editBuilder.replace(range, text);
        });
    }
}
exports.AnnotationManager = AnnotationManager;
//# sourceMappingURL=annotationManager.js.map