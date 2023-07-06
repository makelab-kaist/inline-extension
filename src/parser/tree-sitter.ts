import * as Parser from 'web-tree-sitter';
import { getExtensionPath, getExtensionUri } from '../extension';
import * as MD5 from 'crypto-js/md5';
import { FunctionOrQueryData, LineData } from './types';

const KEYWORDS =
  'pinMode|digitalRead|digitalWrite|analogRead|analogWrite|delay|millis|micros|pulseIn|random|map|min|max|abs|round|radians|degrees|sq|sqrt|constrain|cos|sin|tan|isAlphaNumeric|isAlpha|isAscii|isWhitespace|isControl|isDigit|isGraph|isLowerCase|isPrintable|isPunct|isSpace|isUpperCase|isHexadecimalDigit|toAscii|toLowerCase|toUpperCase|Serial.begin|Serial.print|Serial.println|random|bit|bitClear|bitRead|bitSet|bitToggle|bitWrite|lowByte|highByte|shiftIn|shiftOut|tone';

let parser: any;
initTreeSitter();

async function initTreeSitter() {
  await Parser.init();
  parser = new Parser();
  const uri = getExtensionUri('src', 'parser', 'tree-sitter-cpp.wasm');
  const cpp = await Parser.Language.load(uri.fsPath);
  parser.setLanguage(cpp);
}

export function treeSitterGetParseData(code: string): LineData[] {
  let lineData: LineData[] = [];

  try {
    // Functions and Queries
    const all = [
      ...treeSitterParseFunctions(code),
      ...treeSitterParseQuery(code),
    ];

    // Unique line numbers
    const lines = [
      ...new Set(
        all.map(({ location }) => location.line).sort((a, b) => a - b)
      ),
    ];

    // Package the data per line
    lines.forEach((line) => {
      const data = all.filter(({ location }) => location.line === line);
      const names = data
        .filter(({ type }) => type === 'function')
        .map((elem) => (elem as any).signature);

      const name = names.join('_') + `_${line}`;
      const id = MD5(name).toString().substring(0, 5);

      lineData.push({
        id,
        line,
        data: data as FunctionOrQueryData[],
      });
    });
  } catch (error) {
    console.log(console.error());
  }
  return lineData;
}

// Extract function data using treesitter query
function treeSitterParseFunctions(code: string) {
  const tree = parser.parse(code);
  const query = parser.getLanguage().query(
    `
      (
        (call_expression 
          function: [ 
            (identifier) @fn
            (field_expression) @fn
          ] 
          arguments: (argument_list) @args
        )
        (#match? @fn "${KEYWORDS}")
      )
    `
  );

  const matches = query?.matches(tree.rootNode);

  const data = [];

  for (const match of matches) {
    const captures = match.captures;
    const funName = captures[0].node;
    const args = captures[1].node;

    data.push({
      type: 'function',
      function: funName.text,
      args: args.text.trim().slice(1, -1), // remove parenthesis
      signature: funName.text + args.text,
      location: {
        line: funName.startPosition.row + 1,
        startCol: funName.startPosition.column,
        endCol: args.endPosition.column,
      },
    });
  }
  if (query) query.delete();
  return data;
}

// Extract annotation //? data using treesitter query
function treeSitterParseQuery(code: string) {
  const tree = parser.parse(code);
  const query = parser.getLanguage().query(
    `
        (
          (comment) @comment  
          (#match? @comment "[?]")
        )
      `
  );

  const matches = query?.matches(tree.rootNode);

  const data = [];

  for (const match of matches) {
    const captures = match.captures;
    const comment = captures[0].node;

    // Get the expression and clean up the text
    let expression = comment.text.split('?')[0];
    expression = expression.replace('//', '');
    expression = expression.replace('/*', '');
    expression = expression.replace('*/', '');
    expression = expression.trim();

    data.push({
      type: 'query',
      expression,
      location: {
        line: comment.startPosition.row + 1,
        startCol: comment.startPosition.column,
        endCol: comment.endPosition.column,
      },
    });
  }
  if (query) query.delete();
  return data;
}
