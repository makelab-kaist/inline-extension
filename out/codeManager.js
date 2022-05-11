"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeManager = void 0;
const vscode = require("vscode");
const parser = require("./parser");
const inoCodeTemplate_1 = require("./inoCodeTemplate");
class CodeManager {
    constructor() { }
    static getInstance() {
        if (!CodeManager._instance)
            this._instance = new CodeManager();
        return this._instance;
    }
    getCurrentCode() {
        const doc = vscode.window.activeTextEditor?.document;
        if (!doc || doc.isUntitled) {
            throw new Error('No valid document open');
        }
        return doc.getText();
    }
    // remove all the //? from the current code
    removeQueriesFromCode() {
        const code = this.getCurrentCode();
        const lines = code.split('\n');
        const queries = CodeManager.getInstance().getFilteredLines('query');
        // Loop for the lines with //? and remove those
        for (let { id, line, data } of queries) {
            const editorLine = line - 1; // adjust -1 because vscode editor lines starts at 1
            const textLine = lines[editorLine];
            const { location } = data[0];
            const newText = textLine.slice(0, location.startCol);
            lines[editorLine] = newText;
        }
        const newCode = lines.join('\n');
        return newCode;
    }
    generateCode(fundata, code = undefined) {
        if (!code)
            code = this.getCurrentCode();
        const lines = code.split('\n');
        // Loop for the lines of interest
        for (let { id, line, data } of fundata) {
            const editorLine = line - 1; // adjust -1 because vscode editor lines starts at 1
            const text = lines[editorLine];
            const newText = this.generateCodeForLine(id, line, text, data);
            lines[editorLine] = newText;
        }
        const newCode = lines.join('\n');
        // add library
        return inoCodeTemplate_1.libCode + newCode;
    }
    getFilteredLines(queryType, code = undefined) {
        if (!code)
            code = this.getCurrentCode();
        const lines = parser.getParsedData(code);
        // remap
        return (lines
            .map(({ id, line, data }) => {
            return {
                id,
                line,
                data: data.filter(({ type }) => type === queryType),
            };
        })
            // filter
            .filter(({ data }) => data.length > 0));
    }
    generateCodeForLine(id, line, text, data) {
        let result = text;
        const items = data.length;
        let index = items;
        for (let { function: funcName, args, location } of data.reverse()) {
            const s = location.startCol;
            const e = location.endCol - 1;
            // Serial.print and Serial.println have a dot, that should be replaced with a dash
            if (funcName.includes('.'))
                funcName = funcName.replace('.', '_');
            let newFuncCall = `_${funcName}(${args},"${id}",${line},${index},${items}`;
            if (args === '') {
                // no args
                newFuncCall = `_${funcName}("${id}",${line},${index},${items}`;
            }
            result = result.substring(0, s) + newFuncCall + result.substring(e);
            index--;
        }
        return result;
    }
}
exports.CodeManager = CodeManager;
//# sourceMappingURL=codeManager.js.map