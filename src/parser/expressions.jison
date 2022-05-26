/* description: Parses SwitchBoard commands in cpp filess. */

/* lexical grammar */
%lex
%%

\s+                                               { /* ignore spaces */ }
'HIGH'                                            { return 'HIGH' }
'LOW'                                             { return 'LOW' }
'true'|'false'                                    { return 'BOOLEAN' }
\$\d+                                             { return 'VAR' }     
\@[1-9]\d*                                        { return 'LINE' }
'b'(0|1)+                                         { return 'BINARY_NUM' }     
0|\d+                                             { return 'INTEGER' }     
\".*\"                                            { return 'STRING' }       
[;,]                                              { return 'DELIM'; }
'.'                                               { return '.'; }
'-'                                               { return '-'; }
'+'                                               { return '+'; }     
'/'                                               { return '/'; }     
'*'                                               { return '*'; }     
'=='                                              { return '=='; }     
'!='                                              { return '!='; }     
'<'                                               { return '<'; }     
'>'                                               { return '>'; }     
'<='                                              { return '<='; }     
'>='                                              { return '>='; }     
'!'                                               { return '!'; }     
'('                                               { return '('; }     
')'                                               { return ')'; }     
.                                                 { /* ignore others */}


/lex


%start primary_expression

%% /* language grammar */


primary_expression
  :  expression_list { return $1 }
  ;
  
expression_list
  : expression { $$ = [$1] }
  | expression_list DELIM expression {
       $$= [...$expression_list, $expression]
    }
  ;

expression
  : item { $$ = $1 }
  | item '+' expression { $$ = $1 + $2 + $3}
  | item '-' expression { $$ = $1 + $2 + $3}
  | item '/' expression { $$ = $1 + $2 + $3}
  | item '*' expression { $$ = $1 + $2 + $3}
  // logic
  | '!' item { $$ = $1 + $2 }
  | item '==' expression { $$ = $1 + $2 + $3}
  | item '!=' expression { $$ = $1 + $2 + $3}
  | item '>' expression { $$ = $1 + $2 + $3}
  | item '<' expression { $$ = $1 + $2 + $3}
  | item '>=' expression { $$ = $1 + $2 + $3}
  | item '<=' expression { $$ = $1 + $2 + $3}
  ;

item
  : number { $$= $1 }
  | HIGH { $$ = '1' }
  | LOW { $$ = '0' }
  | STRING { $$ =  $1  }
  | VAR { $$ = $1 }
  | LINE { $$ = $1 }
  | BOOLEAN { $$ = !!$1 }
  | '(' expression ')' { $$ = $1 + $2 + $3 }
  ;

number 
  : float { $$ = $1 }
  | '-' float { $$ = -$2 }
  | '+' float { $$ = $2 }
  | BINARY_NUM { $$ = '"'+$1.slice(1)+'"' }
  ;

float 
  : INTEGER { $$ = $1 }
  | '.' INTEGER { $$ = $1+$2 }
  | INTEGER '.' INTEGER { $$ = $1+$2+$3 }
  ;
