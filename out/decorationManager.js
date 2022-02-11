"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecorationManager = void 0;
class DecorationManager {
    constructor() {
        this.queryDecorations = new Map();
    }
    static getInstance() {
        if (!DecorationManager.instance)
            this.instance = new DecorationManager();
        return this.instance;
    }
    addQueryDecoration(id, line) { }
    removeQueryDecoration(id) { }
    removeAll() { }
}
exports.DecorationManager = DecorationManager;
//# sourceMappingURL=decorationManager.js.map