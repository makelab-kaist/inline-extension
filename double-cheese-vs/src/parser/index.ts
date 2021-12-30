// @ts-ignore
import * as tokenParser from './grammar_tokens';
// @ts-ignore
import * as commentParser from './grammar_comments';

type TextLocation = {
  line: number;
  startCol: number;
  endCol: number;
};

type FunctionData = {
  id: string;
  index: number;
  function: string;
  args: string[];
  location: TextLocation;
};

function getFunctionsData(code: string): FunctionData[] {
  tokenParser.resetCounters(); // important to reset all the counters!
  return tokenParser.parse(code);
}

export { getFunctionsData, TextLocation, FunctionData };