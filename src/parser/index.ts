// @ts-ignore
import * as parser from './grammar';

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

export { getParsedData, TextLocation, Data, LineData };
