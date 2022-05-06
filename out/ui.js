"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmationMessage = exports.showInputBox = exports.showQuickPick = exports.vsError = exports.vsInfoWithLink = exports.vsInfo = void 0;
const vscode = require("vscode");
/**
 *
 * @param {string} message - An info message to display as a VSCode toaster
 */
function vsInfo(message) {
    vscode.window.showInformationMessage(message);
}
exports.vsInfo = vsInfo;
/**
 *
 * @param {string} message
 * @param {string} link
 */
function vsInfoWithLink(message, link) {
    vscode.window
        .showInformationMessage(message, 'Go to File')
        .then((selection) => {
        if (selection) {
            vscode.env.openExternal(vscode.Uri.parse(link));
        }
    });
}
exports.vsInfoWithLink = vsInfoWithLink;
/**
 *
 * @param {string} message - An error message to display as a VSCode toaster
 */
function vsError(message) {
    vscode.window.showErrorMessage(message);
}
exports.vsError = vsError;
/**
 * Show a quick pick
 * @param {string[]} itemArray - List of possible picks
 * @param {string} placeHolder - string placeholder
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