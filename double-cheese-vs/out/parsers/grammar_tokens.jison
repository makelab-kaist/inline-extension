/* description: Parses SwitchBoard commands in cpp filess. */

/* lexical grammar */
%lex
%%

<<EOF>>                     { return 'EOF'; }
\/\/.*                      { /* LINE COMMENT */ }
\/\*[.\s\S]*\*\/            { /* MULTILINE COMNT */}
\s+                         { /* ignore spaces */ }

'digitalRead'               { return 'FN_NAME'}
'analogRead'                { return 'FN_NAME'}
'millis'                    { return 'FN_NAME'}
'micros'                    { return 'FN_NAME'}
'Serial.print'              { return 'FN_NAME'}
'Serial.println'            { return 'FN_NAME'}
'pulseIn'                   { return 'FN_NAME'}
'pulseInLong'               { return 'FN_NAME'}

\"(\\.|[^"\\])*\"           { return 'STRING' }
[a-zA-Z]+[a-zA-Z0-9]*       { return 'IDENTIFIER'; }
[1-9]+[0-9]*                { return 'NUM'; }
'-'                         { return '-' }
'('                         { return '(' }
')'                         { return ')' }
','                         { return ',' }
.                           { /* ignore others */}


/lex
%{
  var MD5 = require("crypto-js/md5");
  let counterID = 0;
%}

%start primary_expression

%% /* language grammar */


primary_expression
  : statements EOF { return $1}
  | EOF { return []; }
  ;


statements
  : function_call { $$= [$1] }
  | statements function_call 
  { 
    if($function_call) $$= [...$statements, $function_call]
    else $$= $statements
  }
  | anything_else { $$= [] }
  | statements anything_else { $$=$1 }
  ;


anything_else
  : STRING | IDENTIFIER | NUM | '-' | '(' | ')' | ',' 
  ;


function_call
  : fun_name fun_arg_list 
  {
    const fullName= $1+'_'+@$.first_line+'_'+@$.first_column+'_'+@$.last_column;

    $$= { id: "$"+counterID++,
          md5: MD5(fullName).toString().substring(0, 6),
          functionName: $1,
          args: $2, 
          location: {
            lineNo: @$.first_line,
            startCol: @$.first_column,
            endCol: @$.last_column
          }
        }
  }
  ;


fun_name
  : FN_NAME { $$ = yytext}
  ;


fun_arg_list
  : '(' ')' { $$= [] }
  | '(' arg_list ')' { $$=$arg_list }
  ;


arg_list
  : arg { $$= [$1] }
  | arg_list ',' arg { $$ = [...$arg_list, $arg] }
  ;


arg
  : id { $$= $1 }
  | number { $$= ""+$1 }
  | string_literal { $$= $1 }
  ;


string_literal
  : STRING { $$= $1 }
  ;


number
  : NUM { $$= Number($1)  }
  | '-' NUM { $$= - Number($2) }
  ;


id
  : IDENTIFIER
    { $$ = yytext; }
  ;