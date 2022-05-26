// @ts-ignore
import * as parser from './grammar';
// @ts-ignore
import * as expr_parser from './expressions';

type TextLocation = {
  line: number;
  startCol: number;
  endCol: number;
};

type Data = {
  type: 'function' | 'query';
  function?: string;
  args?: string;
  expression?: string;
  location: TextLocation;
};

type LineData = {
  id: string;
  line: number;
  data: Data[];
};

function getParsedData(code: string): LineData[] {
  return parser.parse(code);
}

function validateExpressions(expressionString: string): string[] {
  if (expressionString === '') return ['']; // empty
  try {
    return expr_parser.parse(expressionString);
  } catch (error) {}
  return ['Unable to parse'];
}

export { getParsedData, validateExpressions, TextLocation, Data, LineData };
