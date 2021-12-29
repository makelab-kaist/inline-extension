// @ts-ignore
import * as tokenParser from './grammar_tokens';
// @ts-ignore
import * as commentParser from './grammar_comments';

type TextLocation = {
  line: number;
  startCol: number;
  endCol: number;
};

type Token = {
  id: string;
  index: number;
  function: string;
  args: string[];
  location: TextLocation;
};

export { tokenParser, commentParser, TextLocation, Token };
