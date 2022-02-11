import * as vscode from 'vscode';
import { QueryDecoration } from './decoration';
import * as parser from './parser';

class DecorationManager {
  private static instance: DecorationManager;

  private queryDecorations: Map<string, QueryDecoration> = new Map();

  private constructor() {}

  static getInstance() {
    if (!DecorationManager.instance) this.instance = new DecorationManager();
    return this.instance;
  }

  addQueryDecoration(id: string, line: number) {}
  removeQueryDecoration(id: string) {}
  removeAll() {}
}

export { DecorationManager };
