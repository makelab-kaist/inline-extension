"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnotationManager = void 0;
class AnnotationManager {
    constructor() { }
    static getInstance() {
        if (!AnnotationManager.instance)
            this.instance = new AnnotationManager();
        return this.instance;
    }
}
exports.AnnotationManager = AnnotationManager;
//# sourceMappingURL=annotationManager.js.map