"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmationMessage = exports.showInputBox = exports.showQuickPick = exports.vsError = exports.vsInfo = void 0;
const vscode = require("vscode");
/**
 *
 * @param {String} message - An info message to display as a VSCode toaster
 */
function vsInfo(message) {
    vscode.window.showInformationMessage(message);
}
exports.vsInfo = vsInfo;
/**
 *
 * @param {String} message - An error message to display as a VSCode toaster
 */
function vsError(message) {
    vscode.window.showErrorMessage(message);
}
exports.vsError = vsError;
/**
 * Show a quick pick
 * @param {String[]} itemArray - List of possible picks
 * @param {String} placeHolder - String placeholder
 * @returns synchronously returns the picked string or undefined
 */
async function showQuickPick(itemArray, placeHolder) {
    const result = await vscode.window.showQuickPick(itemArray, {
        placeHolder,
        onDidSelectItem: (item) => item,
    });
    return result?.trim();
}
exports.showQuickPick = showQuickPick;
/**
 * Show an input text box in VSCode
 * @param {*} value - initial value
 * @param {*} placeHolder - placeholder string
 * @param {function} validationFn - function to validate the value, take text as input. Retursn true if not valid, false if valid
 * @returns synchronously returns the picked string or udnefined
 */
async function showInputBox(value, placeHolder, validationFn) {
    const result = await vscode.window.showInputBox({
        value,
        placeHolder,
        validateInput: (text) => validationFn(text),
    });
    return result;
}
exports.showInputBox = showInputBox;
/**
 * Ask for confirmation
 * @param {*} msg - the question to ask
 * @param {string[]} options - array of options
 * @returns - return one of the options
 */
async function confirmationMessage(msg, options) {
    return vscode.window.showInformationMessage(msg, ...options);
}
exports.confirmationMessage = confirmationMessage;
//# sourceMappingURL=ui.js.map