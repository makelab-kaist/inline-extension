"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParsedData = void 0;
// @ts-ignore
const parser = require("./grammar");
function getParsedData(code) {
    return parser.parse(code);
}
exports.getParsedData = getParsedData;
//# sourceMappingURL=index.js.map