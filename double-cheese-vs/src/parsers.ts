// @ts-ignore
import * as tokenParser from './parsers/grammar_tokens';
// @ts-ignore
import * as commentParser from './parsers/grammar_tokens';

type TextLocation = {
  lineNo: number;
  startCol: number;
  endCol: number;
};

type Token = {
  functionName: string;
  args: string[];
  id: string;
  lineId: number;
  md5: string;
  location: TextLocation;
};

export { tokenParser, commentParser, TextLocation, Token };
