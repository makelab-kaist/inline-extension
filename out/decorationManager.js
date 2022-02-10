"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecorationManager = void 0;
const vscode = require("vscode");
const decorations = {
    functionHighlight: vscode.window.createTextEditorDecorationType({
        border: '1px solid green',
    }),
};
class DecorationManager {
    constructor() {
        this.queryDecorations = new Map();
    }
    static getInstance() {
        if (!DecorationManager.instance)
            this.instance = new DecorationManager();
        return this.instance;
    }
    updateQueryList(queries) {
        this.queryDecorations = new Map();
        // queries.forEach(({ id, line, data }) => {});
    }
    setDecoration(id, value) { }
}
exports.DecorationManager = DecorationManager;
//# sourceMappingURL=decorationManager.js.map