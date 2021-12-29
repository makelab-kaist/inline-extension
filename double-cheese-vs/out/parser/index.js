"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFunctionsData = void 0;
// @ts-ignore
const tokenParser = require("./grammar_tokens");
function getFunctionsData(code) {
    return tokenParser.parse(code);
}
exports.getFunctionsData = getFunctionsData;
//# sourceMappingURL=index.js.map