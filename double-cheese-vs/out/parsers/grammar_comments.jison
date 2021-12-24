/* description: Parses SwitchBoard commands in cpp filess. */

/* lexical grammar */
%lex
%%

<<EOF>>                     { return 'EOF'; }
\/\*[.\s\S]*\*\/            { /* MULTILINE COMNT */}
\/\/                        { return 'COMMENT'}
'?'                         { return '?'}
'$'                         { return '$'}
0|[1-9]+[0-9]*                { return 'NUM'; }

'+'                         { return '+'}
'-'                         { return '-'}
'*'                         { return '*'}
'/'                         { return '/'}
'%'                         { return '%'}
'=='                        { return '=='}
'!='                        { return '!='}
'<'                         { return '<'}
'<='                        { return '<='}
'>'                         { return '>'}
'>='                        { return '>='}

\s+                         { /* ignore spaces */ }
.                           { /* ignore others */}


/lex
%{
%}

%start primary_expression

%% /* language grammar */


primary_expression
  : query_expressions EOF { return $1}
  | EOF { return []; }
  ;


query_expressions
  : query_expression
    { $$ = [$1]; }
  | query_expressions query_expression
    { $$.push ($2); }
  | anything_else { $$= [] }
  | query_expressions anything_else { $$=$1 }
  ;

anything_else
  : NUM | ',' | '$' | binary_op
  ;

query_expression
  : COMMENT '?'
    { $$ = {
        line: @$.first_line,
        position: @$.last_column,
        expr: ''
      }
    }
  | COMMENT expression '?'
    { $$ = {
        line: @$.first_line,
        position: @$.last_column,
        ...$2
      } 
    }
  ;

expression 
  : id 
    {
      $$ = { ids: [$1], expr: $1  }
     } 
  
  | number
    { $$= {ids: [], expr: $1 } }

  | expression binary_op id
    { 
      $1.ids.push($3)
      $1.ids= [...new Set($1.ids)] // make sure all elements are unique
      $$= { ids: $1.ids,
        expr: `${$1.expr} ${$2} ${$3}`
      }
    }
  | expression binary_op number
    { 
      $$= { ids: $1.ids,
        expr: `${$1.expr} ${$2} ${$3}`
      }
    }
  ;

id
  : '$' number 
  { $$ = '$'+$2 }
  ;

number
  : NUM { $$= Number($1)  }
  ;

binary_op 
  : '+' | '-' | '*' | '/' | '%' | '==' | '!=' | '<' | '<=' | '>' | '>='
  { $$= $1 }
  ;