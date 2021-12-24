"use strict";
class CodeManager {
    constructor() { }
    static getInstance() {
        if (!CodeManager.instance)
            this.instance = new CodeManager();
        return this.instance;
    }
}
//# sourceMappingURL=codeManager.js.map