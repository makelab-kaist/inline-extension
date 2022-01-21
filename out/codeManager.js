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
            const lines = parser.getParsedData(code);
            // result = this.generateCode(code, data);
            console.log(lines);
        }
        catch (err) {
            console.error('Unable to parse the code');
        }
        return result;
    }
}
exports.CodeManager = CodeManager;
//# sourceMappingURL=codeManager.js.map