// @ts-ignore
import * as tokenParser from './grammar_tokens';

type TextLocation = {
  lineNo: number;
  startCol: number;
  endCol: number;
};

type Token = {
  name: string;
  fullname: string;
  args: string[];
  id: number;
  lineId: number;
  location: TextLocation;
  md5: string;
  md5Id: string;
};

export { tokenParser, TextLocation, Token };
