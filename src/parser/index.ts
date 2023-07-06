/**
 * Wrapper for the grammar and expression-grammar parsers
 */
// @ts-ignore
import * as parser from './grammar';
// @ts-ignore
import * as expr_parser from './expression-language';
import {FunctionOrQueryData, LineData} from './types';
import {treeSitterGetParseData} from './tree-sitter';

function getParsedData(code: string): LineData[] {
  return parser.parse(code);
}

function transpileExpression(expression: string): string {
  return expr_parser.parse(expression);
}


export { getParsedData, treeSitterGetParseData, transpileExpression, FunctionOrQueryData, LineData };


