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
        const fundata = parser.getFunctionsData(code);
        const result = this.generateCode(code, fundata);
        return result;
    }
    generateCode(code, fundata) {
        const lines = code.split('\n');
        for (let tok of fundata.reverse()) {
            // bottom up
            const line = tok.location.line - 1;
            const s = tok.location.startCol;
            const e = tok.location.endCol;
            const text = lines[line];
            lines[line] =
                text.substring(0, s) +
                    this.getSubstitutionCode(tok) +
                    text.substring(e);
        }
        const newCode = lines.join('\n');
        return this.prepend(`#include "ExtensionHelpers.h"`, newCode);
    }
    prepend(toPrePend, code) {
        return toPrePend + '\n' + code;
    }
    getSubstitutionCode(tok) {
        const args = tok.args.join(',');
        return `_${tok.function}(${args},"${tok.id}",${tok.location.line})`;
    }
}
exports.CodeManager = CodeManager;
//# sourceMappingURL=codeManager.js.map