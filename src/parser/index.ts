// @ts-ignore
import * as parser from './grammar';
// @ts-ignore
import * as expr_parser from './expressions';

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

export { getParsedData, FunctionOrQueryData, LineData };
