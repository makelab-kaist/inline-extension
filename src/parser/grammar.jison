/* description: Parses SwitchBoard commands in cpp filess. */

/* lexical grammar */
%lex
%%

<<EOF>>                                           { return 'EOF'  }
[\r\n]+                                            { return 'EOL' }
\/\/.*\?                                          { return 'QUERY' }          
\/\/.*                                            { /* LINE COMMENT */ }
\/\*[.\s\S]*\*\/                                  { /* MULTILINE COMNT */}
\s+                                               { /* ignore spaces */ }
'digitalRead'                                     { return 'FN_NAME' }
'analogRead'                                      { return 'FN_NAME' }
                           
'('                                               { return '(' }
')'                                               { return ')' }
.                                                 { return 'ANY' }

/lex
%{

  const MD5 = require("crypto-js/md5");

  function getId (statements, length){
    const long_name= statements.reduce ( (acc, d) => {
        if (d.type === 'function')
            return acc + d.function + "_" + d.args + "_";
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

    if ($1.length > 0) $$ = {id: getId($1, 6), line: @$.first_line, data:$1}  
    else $$ = undefined
  }
  | statements EOF {
    if ($1.length > 0) $$ = {id: getId($1, 6), line: @$.first_line, data:$1}  
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
  : FN_NAME params
  {
    $$= { type: "function",
          function: $1,
          args: $2.substring(1, $2.length-2),  // strip ()
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
          location: {
            line: @$.first_line,
            startCol: @$.first_column,
            endCol: @$.last_column
          }
        }
  }
  ;



params
  : '(' ')' { $$ = $1 + $2}
  |  '(' params ')' { $$ = $1+$2+$3}
  | params params { $$ = $1+$2}
  | any {$$ = $1 }
  ;

any
  : ANY { $$ = $1 }
  ;


anything 
  : ANY | '(' | ')' 
  ;