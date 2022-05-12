"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAnnotation = exports.removeAllAnnotations = exports.updateAnnotation = exports.addAnnotation = void 0;
const vscode = require("vscode");
const LINE_HIGHLIGHT = vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
    backgroundColor: 'rgb(205, 187, 8)',
});
const annotations = new Map();
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
            color: color,
            backgroundColor,
            margin: '20px',
        },
    });
    const range = lineToRange(line);
    activeEditor?.setDecorations(decorator, [{ range }]);
    return decorator;
}
function highlightLine(line) {
    const activeEditor = vscode.window.activeTextEditor;
    activeEditor?.setDecorations(LINE_HIGHLIGHT, [{ range: lineToRange(line) }]);
}
function removeHighlightLine() {
    const activeEditor = vscode.window.activeTextEditor;
    activeEditor?.setDecorations(LINE_HIGHLIGHT, []);
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
    removeHighlightLine();
}
exports.removeAllAnnotations = removeAllAnnotations;
function updateAnnotation(id, line, annotation) {
    if (!annotations.has(id)) {
        // annotaiton does not exist. Exit
        return;
    }
    highlightLine(line);
    const curr = annotations.get(id);
    curr.dispose();
    const decoration = createDecoration(line, annotation.contentText, annotation.color, annotation.backgroundColor);
    annotations.set(id, decoration);
}
exports.updateAnnotation = updateAnnotation;
function evaluateExpression(expression, values) {
    let substituion = expression.replace(/\$[0-9]/gi, function (x) {
        const index = parseInt(x.slice(1));
        return values[index];
    });
    try {
        return `${eval(substituion)}`;
    }
    catch (err) {
        return '';
    }
}
//# sourceMappingURL=annotations.js.map