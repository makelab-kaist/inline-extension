/* lexical grammar */
%lex
%%

<<EOF>>                                           { return 'EOF'  }
[\r\n]+                                           { return 'EOL' }
\/\/.*\?                                          { return 'QUERY' }          
\/\/.*                                            { /* LINE COMMENT */ }
\/\*[.\s\S]*\*\/                                  { /* MULTILINE COMMENT */}
// \s+                                            { /* ignore spaces */ }

///////////// begin ARDUINO KEYWORDS

// Pins
'pinMode'                                         { return 'FN_NAME' }
'digitalRead'                                     { return 'FN_NAME' }
'digitalWrite'                                    { return 'FN_NAME' }
'analogRead'                                      { return 'FN_NAME' }
'analogWrite'                                     { return 'FN_NAME' }

// Time
'delay'                                           { return 'FN_NAME' }
'millis'                                          { return 'FN_NAME' }
'micros'                                          { return 'FN_NAME' }
'pulseIn'                                         { return 'FN_NAME' }

// Random
'random'                                          { return 'FN_NAME' }
'map'                                             { return 'FN_NAME' }

// Math
'min'                                             { return 'FN_NAME' }
'max'                                             { return 'FN_NAME' }
'abs'                                             { return 'FN_NAME' }
'round'                                           { return 'FN_NAME' }
'radians'                                         { return 'FN_NAME' }
'degrees'                                         { return 'FN_NAME' }
'sq'                                              { return 'FN_NAME' }
'sqrt'                                            { return 'FN_NAME' }
'constrain'                                       { return 'FN_NAME' }
'cos'                                             { return 'FN_NAME' }
'sin'                                             { return 'FN_NAME' }
'tan'                                             { return 'FN_NAME' }

// Characters
'isAlphaNumeric'                                  { return 'FN_NAME' }
'isAlpha'                                         { return 'FN_NAME' }
'isAscii'                                         { return 'FN_NAME' }
'isWhitespace'                                    { return 'FN_NAME' }
'isControl'                                       { return 'FN_NAME' }
'isDigit'                                         { return 'FN_NAME' }
'isGraph'                                         { return 'FN_NAME' }
'isLowerCase'                                     { return 'FN_NAME' }
'isPrintable'                                     { return 'FN_NAME' }
'isPunct'                                         { return 'FN_NAME' }
'isSpace'                                         { return 'FN_NAME' }
'isUpperCase'                                     { return 'FN_NAME' }
'isHexadecimalDigit'                              { return 'FN_NAME' }
'toAscii'                                         { return 'FN_NAME' }
'toLowerCase'                                     { return 'FN_NAME' }
'toUpperCase'                                     { return 'FN_NAME' }

// Serial
'Serial.begin'                                    { return 'FN_NAME' }
'Serial.print'                                    { return 'FN_NAME' }
'Serial.println'                                  { return 'FN_NAME' }

// Random + Trigonometry                           
'random'                                          { return 'FN_NAME' }

// Bits and Bytes
'bit'                                             { return 'FN_NAME' }
'bitClear'                                        { return 'FN_NAME' }
'bitRead'                                         { return 'FN_NAME' }
'bitSet'                                          { return 'FN_NAME' }
'bitToggle'                                       { return 'FN_NAME' }
'bitWrite'                                        { return 'FN_NAME' }
'lowByte'                                         { return 'FN_NAME' }
'highByte'                                        { return 'FN_NAME' }

// Advanced IO
'shiftIn'                                         { return 'FN_NAME' }
'shiftOut'                                        { return 'FN_NAME' }
'tone'                                            { return 'FN_NAME' }
'noTone'                                          { return 'FN_NAME' }

///////////// end ARDUINO KEYWORDS

\s*'('                                              { return '(' }
')'                                                 { return ')' }
.                                                   { return 'ANY' }

/lex
%{

  const MD5 = require("crypto-js/md5");

  function getId (statements, line, length){
    const long_name= statements.reduce ( (acc, d) => {
        if (d.type === 'function')
            return acc + d.function + "_" + d.args + "_" + line;
        return acc
    }, "");

    return MD5(long_name).toString().substring(0, length);
  }

%}

%start primary_expression

%% /* language grammar */


primary_expression
  : lines  { return $1 }
  ;

lines
  : line { 
    if($line) $$= [$1]
    else $$ =[] 
  }
  | lines line 
  { 
    if($line) $$ = [...$lines, $line]
    else $$ = $lines
  }
  ;

line 
  : statements EOL { 
    const line = @$.first_line;
    if ($1.length > 0) $$ = {id: getId($1, line, 6), line, data:$1}  
    else $$ = undefined
  }
  | statements EOF {
    if ($1.length > 0) $$ = {id: getId($1, line, 6), line, data:$1}  
    else $$ = undefined
  }
  | EOL { $$ = undefined }
  | EOF { }
  ;


statements
  : statement { $$= [$1]}
  | statements statement 
  { 
    if($statement) $$= [...$statements, $statement]
    else $$= $statements
  }
  | anything  { $$= []; }
  | statements anything { $$= $1; }
  ;

statement 
  : function_call { $$ = $1 }
  | query { $$ = $1 }
  ;
  
function_call
  : FN_NAME '(' params ')'
  {
    $$= { type: "function",
          function: $1,
          args: $3.substring(0, $3.length),  // strip ()
          location: {
            line: @$.first_line,
            startCol: @$.first_column,
            endCol: @$.last_column
          }
        }
  }
  | FN_NAME '(' ')'
  {
    $$= { type: "function",
          function: $1,
          args: "",
          location: {
            line: @$.first_line,
            startCol: @$.first_column,
            endCol: @$.last_column
          }
        }
  }
  ;

query
  : QUERY
  {
    $$= { type: "query",
          expression: $1.slice(2,-1).trim(),
          location: {
            line: @$.first_line,
            startCol: @$.first_column,
            endCol: @$.last_column
          }
        }
  }
  ;



params
  // : '(' ')' { $$ = $1 + $2}
  :  '(' params ')' { $$ = $1+$2+$3}
  | params params { $$ = $1+$2}
  | params ANY { $$ = $1+$2 }
  | ANY {$$ = $1 }
  ;



anything 
  : ANY | '(' | ')' 
  ;