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
    // parseCode(): parser.LineData[] {
    //   const code = this.getCurrentCode();
    //   const lines: parser.LineData[] = parser.getParsedData(code);
    //   return lines;
    // }
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
    // parseAndDecorate() {
    //   let code = '';
    //   try {
    //     // Get current code
    //     code = this.getCurrentCode();
    //   } catch (err) {
    //     throw new Error('Unable to parse the code');
    //   }
    //   // Get all lines with valid code
    //   const lines: parser.LineData[] = this.getFilteredLines(code, 'function');
    // Decorations
    //   const flat = lines
    //     .map(({ data }) => data)
    //     .reduce((acc, curr) => [...acc, ...curr], [])
    //     .map(({ location }) => location);
    //   const ranges = flat.reduce(
    //     (acc: vscode.Range[], { line, startCol, endCol }): vscode.Range[] => {
    //       const range = new vscode.Range(
    //         new vscode.Position(line - 1, startCol),
    //         new vscode.Position(line - 1, endCol)
    //       );
    //       return [...acc, range];
    //     },
    //     []
    //   );
    //   DecorationManager.getInstance().decorateFunctions(ranges);
    // }
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