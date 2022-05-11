"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAnnotation = exports.removeAllAnnotations = exports.updateAnnotation = exports.addAnnotation = void 0;
const vscode = require("vscode");
const annotations = new Map();
const HIGHLIGH_COLOR = 'yellow';
function addAnnotation(id, line, annotation) {
    if (annotations.has(id)) {
        throw new Error(`Annotation ${id} already existing`);
    }
    const decoration = createDecoration(line, annotation.contentText);
    annotations.set(id, decoration);
}
exports.addAnnotation = addAnnotation;
function createDecoration(line, contentText, color = 'grey', backgroundColor = 'none') {
    const activeEditor = vscode.window.activeTextEditor;
    const decorator = vscode.window.createTextEditorDecorationType({
        after: {
            contentText,
            color,
            backgroundColor,
            margin: '20px',
        },
    });
    const range = lineToRange(line);
    activeEditor?.setDecorations(decorator, [{ range }]);
    return decorator;
}
function lineToRange(line) {
    const end = 10000; // a large number
    const range = new vscode.Range(new vscode.Position(line - 1, end), // lines starts at 0
    new vscode.Position(line - 1, end) // lines start at 0
    );
    return range;
}
function removeAnnotation(id) {
    if (annotations.has(id)) {
        const decorator = annotations.get(id);
        decorator.dispose();
        annotations.delete(id);
    }
}
exports.removeAnnotation = removeAnnotation;
function removeAllAnnotations() {
    annotations.forEach((decorator) => decorator.dispose());
    annotations.clear();
}
exports.removeAllAnnotations = removeAllAnnotations;
function updateAnnotation(id, line, annotation, timeout = 500) {
    if (!annotations.has(id)) {
        // annotaiton does not exist. Exit
        return;
    }
    const curr = annotations.get(id);
    curr.dispose();
    // flashing highlight if timeout if > 0
    if (timeout > 0) {
        const highlight = createDecoration(line, annotation.contentText, HIGHLIGH_COLOR);
        setTimeout(() => {
            highlight.dispose();
            const decoration = createDecoration(line, annotation.contentText, annotation.color, annotation.backgroundColor);
            annotations.set(id, decoration);
        }, timeout);
    }
    else {
        const decoration = createDecoration(line, annotation.contentText, annotation.color, annotation.backgroundColor);
        annotations.set(id, decoration);
    }
}
exports.updateAnnotation = updateAnnotation;
//# sourceMappingURL=annotations.js.map