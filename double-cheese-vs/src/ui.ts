import * as vscode from 'vscode';

/**
 *
 * @param {String} message - An info message to display as a VSCode toaster
 */
function vsInfo(message: string): void {
  vscode.window.showInformationMessage(message);
}

/**
 *
 * @param {String} message - An error message to display as a VSCode toaster
 */
function vsError(message: string): void {
  vscode.window.showErrorMessage(message);
}

/**
 * Show a quick pick
 * @param {String[]} itemArray - List of possible picks
 * @param {String} placeHolder - String placeholder
 * @returns synchronously returns the picked string or undefined
 */
async function showQuickPick(
  itemArray: string[],
  placeHolder: string
): Promise<string | undefined> {
  const result = await vscode.window.showQuickPick(itemArray, {
    placeHolder,
    onDidSelectItem: (item) => item,
  });
  return result?.trim();
}

/**
 * Show an input text box in VSCode
 * @param {*} value - initial value
 * @param {*} placeHolder - placeholder string
 * @param {function} validationFn - function to validate the value, take text as input. Retursn true if not valid, false if valid
 * @returns synchronously returns the picked string or udnefined
 */
async function showInputBox(
  value: string,
  placeHolder: string,
  validationFn: Function
): Promise<string | undefined> {
  const result = await vscode.window.showInputBox({
    value,
    placeHolder,
    validateInput: (text) => validationFn(text),
  });
  return result;
}

/**
 * Ask for confirmation
 * @param {*} msg - the question to ask
 * @param {string[]} options - array of options
 * @returns - return one of the options
 */
async function confirmationMessage(msg: string, options: string[]) {
  return vscode.window.showInformationMessage(msg, ...options);
}

export { vsInfo, vsError, showQuickPick, showInputBox, confirmationMessage };
