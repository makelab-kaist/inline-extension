"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeManager = void 0;
const vscode = require("vscode");
const parser = require("./parser");
class CodeManager {
    constructor() { }
    static getInstance() {
        if (!CodeManager.instance)
            this.instance = new CodeManager();
        return this.instance;
    }
    parseAndGenerateCode() {
        let code = '';
        try {
            // Get current code
            code = this.getCurrentCode();
        }
        catch (err) {
            throw new Error('Unable to parse the code');
        }
        // Get all lines with valid code
        const lines = this.getFilteredLines(code, 'function');
        // Substitute them in the code to generate a new code
        return this.generateCode(code, lines);
    }
    getFilteredLines(code, queryType) {
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
    getCurrentCode() {
        const doc = vscode.window.activeTextEditor?.document;
        if (!doc || doc.isUntitled) {
            throw new Error('No valid document open');
        }
        const code = doc.getText();
        return code;
    }
    generateCode(code, fundata) {
        const lines = code.split('\n');
        // prepend a library
        lines.unshift('#include "_functions.h"');
        // Loop for the lines of interest
        for (let { id, line, data } of fundata) {
            const text = lines[line];
            const newText = this.generateCodeForLine(id, line + 1, text, data); // adjust line starting from 1
            lines[line] = newText;
        }
        const newCode = lines.join('\n');
        return newCode;
    }
    generateCodeForLine(id, line, text, data) {
        let result = text;
        const items = data.length;
        let index = items;
        console.log(data);
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