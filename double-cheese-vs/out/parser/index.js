"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFunctionsData = void 0;
// @ts-ignore
const tokenParser = require("./grammar_tokens");
function getFunctionsData(code) {
    tokenParser.resetCounters(); // important to reset all the counters!
    return tokenParser.parse(code);
}
exports.getFunctionsData = getFunctionsData;
//# sourceMappingURL=index.js.map