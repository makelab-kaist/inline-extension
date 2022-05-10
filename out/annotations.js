"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAndShowAnnotation = void 0;
const vscode = require("vscode");
const annotations = new Map();
function createDecoration(contentText, line, color = 'grey', backgroundColor = 'none') {
    const decorator = vscode.window.createTextEditorDecorationType({
        after: {
            contentText,
            color,
            backgroundColor,
            margin: '20px',
        },
    });
    const range = lineToRange(line);
    return {
        decorator,
        location: range,
    };
}
function showDecoration(decoration) {
    const activeEditor = vscode.window.activeTextEditor;
    activeEditor?.setDecorations(decoration.decorator, [
        { range: decoration.location },
    ]);
}
function showAnnotation(annotation, timeout = 500) {
    const { text, line, color } = annotation;
    const highlight = createDecoration(text, line, color.highlightColor);
    const normal = createDecoration(text, line, color.color);
    showDecoration(highlight);
    if (timeout > 0) {
        setTimeout(() => {
            highlight.decorator.dispose();
            showDecoration(normal);
        }, timeout);
    }
}
function lineToRange(line) {
    const end = 10000; // a large number
    const range = new vscode.Range(new vscode.Position(line - 1, end), // lines starts at 0
    new vscode.Position(line - 1, end) // lines start at 0
    );
    return range;
}
function addAndShowAnnotation(id, line, text = ' NaN', color = {
    color: 'grey',
    backgroundColor: 'none',
    highlightColor: 'grey',
}) {
    if (annotations.has(id)) {
        throw new Error(`Annotation ${id} already existing`);
    }
    const annotation = {
        id,
        line,
        text,
        color,
    };
    showAnnotation(annotation);
    annotations.set(id, annotation);
}
exports.addAndShowAnnotation = addAndShowAnnotation;
//# sourceMappingURL=annotations.js.map