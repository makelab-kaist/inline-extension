"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAnnotations = exports.createAnnotation = void 0;
const vscode = require("vscode");
const annotations = new Map();
function createDecoration(contentText, color = 'green', backgroundColor = 'none') {
    return vscode.window.createTextEditorDecorationType({
        after: {
            contentText,
            color,
            backgroundColor,
            margin: '20px',
        },
    });
}
function removeDecoration(id) {
    const annotation = annotations.get(id);
    annotation.decorator.dispose();
    annotations.delete(id);
}
function createAnnotation(id, line, value = 'NaN') {
    if (annotations.has(id)) {
        removeDecoration(id); // remove if already exists
    }
    // crate a new annotation
    let color = 'green';
    if (value === 'NaN') {
        color = 'grey';
    }
    const annotation = {
        id,
        line,
        value,
        decorator: createDecoration(value, color),
    };
    annotations.set(id, annotation);
    // show it
    const end = 10000; // a large number
    const range = new vscode.Range(new vscode.Position(line - 1, end), // lines starts at 0
    new vscode.Position(line - 1, end) // lines start at 0
    );
    const activeEditor = vscode.window.activeTextEditor;
    activeEditor?.setDecorations(annotation.decorator, [{ range }]);
}
exports.createAnnotation = createAnnotation;
function removeAnnotations() {
    annotations.forEach(({ decorator }) => decorator.dispose());
    annotations.clear();
}
exports.removeAnnotations = removeAnnotations;
//# sourceMappingURL=annotations.js.map