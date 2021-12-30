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
        // Get current Code
        const doc = vscode.window.activeTextEditor?.document;
        if (!doc || doc.isUntitled) {
            throw new Error('No valid document open');
        }
        const code = doc.getText();
        // Parse and generate new code
        let result = code;
        try {
            const fundata = parser.getFunctionsData(code);
            result = this.generateCode(code, fundata);
        }
        catch (err) {
            console.error('Unable to parse the code');
        }
        return result;
    }
    generateCode(code, fundata) {
        const lines = code.split('\n');
        let prevLine = -1; // out of range
        // Loop bottom up
        for (let tok of fundata.reverse()) {
            const line = tok.location.line - 1;
            const s = tok.location.startCol;
            const e = tok.location.endCol;
            const text = lines[line];
            const newLine = prevLine !== line; // we changed line
            prevLine = line;
            // substitute function call
            lines[line] =
                text.substring(0, s) +
                    this.getSubstitutionCode(tok, newLine) +
                    text.substring(e);
        }
        const newCode = lines.join('\n');
        // prepend library
        return this.prepend(`#include "ExtensionHelpers.h"`, newCode);
    }
    prepend(toPrePend, code) {
        return toPrePend + '\n' + code;
    }
    getSubstitutionCode(tok, newLine) {
        const fnName = tok.function;
        let args = '';
        if (tok.args.length > 0) {
            args = tok.args.join(',');
            args += ',';
        }
        return `_${fnName}(${args}${tok.location.line},${tok.index},${newLine})`;
    }
}
exports.CodeManager = CodeManager;
//# sourceMappingURL=codeManager.js.map