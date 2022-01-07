"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnnotations = exports.getFunctionsData = void 0;
// @ts-ignore
const tokenParser = require("./grammar_tokens");
// @ts-ignore
const commentParser = require("./grammar_comments");
function getFunctionsData(code) {
    tokenParser.resetCounters(); // important to reset all the counters!
    return tokenParser.parse(code);
}
exports.getFunctionsData = getFunctionsData;
function getAnnotations(code) {
    return commentParser.parse(code);
}
exports.getAnnotations = getAnnotations;
//# sourceMappingURL=index.js.map