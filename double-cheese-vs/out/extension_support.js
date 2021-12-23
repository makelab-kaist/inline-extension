"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBuildFolderName = exports.getBuildFolderUri = exports.copyFileOrFolder = exports.getCurrentWorkspace = void 0;
const vscode = require("vscode");
// WORKSPACE
function workspaceUri(workspace, subdirs = []) {
    return vscode.Uri.joinPath(workspace.uri, ...subdirs);
}
function getWorkspace(openDocument) {
    const workspace = vscode.workspace.getWorkspaceFolder(openDocument.uri);
    if (!workspace)
        throw new Error('No workspace available');
    return workspace;
}
function getOpenWorkspace() {
    const openDocument = vscode.window.activeTextEditor?.document;
    if (!openDocument)
        throw new Error('No document open available');
    return getWorkspace(openDocument);
}
async function getCurrentWorkspace() {
    /**
     * Get current workspace
     * 1) if any document is open
     * 2) else if only one workspace is open, return that one
     * 3) else if multiple workspaces are open ask the user to choose
     * 4) else if no workspace is open, ask user to pick one
     */
    // 1) a document is open
    const openDocumnet = vscode.window.activeTextEditor?.document;
    if (openDocumnet) {
        const workspace = getOpenWorkspace();
        // if workspace is defined, return it
        if (workspace) {
            return workspace;
        }
    }
    // the workspace could be undefined if the current file does not belong to a workspace
    // else get all workspaces
    const workspaces = vscode.workspace.workspaceFolders;
    // 2) if there is only one open, return it
    if (workspaces?.length === 1)
        return workspaces[0];
    // 3) else multiple workspaces, therfore ask the user to pick one
    const selection = await vscode.window.showWorkspaceFolderPick();
    if (selection)
        return selection;
    // 4) else if no workspace is open, ask user to open one
    throw new Error('No workspace folder is open');
}
exports.getCurrentWorkspace = getCurrentWorkspace;
async function getBuildFolderUri() {
    const curr = await getCurrentWorkspace();
    return vscode.Uri.joinPath(curr.uri, '.out');
}
exports.getBuildFolderUri = getBuildFolderUri;
function getBuildFolderName() {
    return '.out';
}
exports.getBuildFolderName = getBuildFolderName;
/**
 * Copy a single file from a folder to a folder or a folder (nested directories are ignored)
 * @param {String} filenameSrc - the file name
 * @param {vscode.Uri} sourceDirUri - the source folder
 * @param {String} filenameDest - the file name
 * @param {vscode.Uri} destDirUri - the target folder
 */
async function copyFileOrFolder(sourceDirUri, targetSrc, destDirUri, targetDest) {
    const src = vscode.Uri.joinPath(sourceDirUri, targetSrc);
    const dest = vscode.Uri.joinPath(destDirUri, targetDest);
    return vscode.workspace.fs.copy(src, dest, { overwrite: true });
}
exports.copyFileOrFolder = copyFileOrFolder;
//# sourceMappingURL=extension_support.js.map