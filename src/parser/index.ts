// @ts-ignore
import * as parser from './grammar';
// @ts-ignore
/**
 * Wrapper for the grammar and expression-grammar parsers
 */
import * as expr_parser from './expression-language';

type TextLocation = {
  line: number;
  startCol: number;
  endCol: number;
};

type FunctionOrQueryData = {
  type: 'function' | 'query';
  function?: string;
  args?: string;
  expression?: string;
  location: TextLocation;
};

type LineData = {
  id: string;
  line: number;
  data: FunctionOrQueryData[];
};

function getParsedData(code: string): LineData[] {
  return parser.parse(code);
}

function transpileExpression(expression: string): string {
  return expr_parser.parse(expression);
}

export { getParsedData, transpileExpression, FunctionOrQueryData, LineData };
