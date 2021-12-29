import * as parsers from './parsers';

class CodeManager {
  private static instance: CodeManager;

  private constructor() {}

  static getInstance() {
    if (!CodeManager.instance) this.instance = new CodeManager();
    return this.instance;
  }
}
