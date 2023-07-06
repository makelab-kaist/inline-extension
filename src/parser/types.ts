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
  signature?: string;
};

type LineData = {
  id: string;
  line: number;
  data: FunctionOrQueryData[];
};

export { FunctionOrQueryData, LineData };
