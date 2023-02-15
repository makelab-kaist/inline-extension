/* description: Parses SwitchBoard commands in cpp filess. */

/* lexical grammar */
%lex
%%

\s+                                               { /* ignore spaces */ }
'assert'                                          { return 'ASSERT' }
'above'                                           { return 'ABOVE' }
'below'                                           { return 'BELOW' }
'between'                                         { return 'BETWEEN' }
'filter'                                          { return 'FILTER' }
'save'                                            { return 'SAVE' }
'print'                                           { return 'PRINT' }
'graph'                                           { return 'GRAPH' }
'hist'                                            { return 'HIST' }
'log'                                             { return 'LOG' }
[^|]+                                             { return 'EXP' }
'|'                                               { return 'THEN' }



/lex


%start result

%% /* language grammar */


result
  : primary_expression { return $1.replaceAll(' ','').trim() }
  ;

primary_expression
  : list { $$ = $1 }
  | list THEN function_sequence { $$ = `this.pipe(${$3})(${$1})` }
  | function_sequence { $$ = `this.pipe(${$1})(\$\$)` } // $$ has to be escaped in jison
  ;

function_sequence 
  : function_call {$$ = $1 }
  | function_sequence THEN function_call { $$ = $1 + ',' + $3 }
  ;

function_call
  : builtin_function { $$= $1 + '()' }
  | builtin_function list { $$ = $1 + '(' + $2 + ')' }
  ;

list
  : EXP  { $$ = $1 }
  | list ',' EXP { $$ = $1 + ',' + $2 }
  ;

builtin_function
  : ASSERT { $$ = 'this.assert' }
  | ABOVE { $$ = 'this.above' }
  | BELOW { $$ = 'this.below' }
  | BETWEEN { $$ = 'this.between' }
  | FILTER { $$ = 'this.filter' }
  | SAVE { $$ = 'this.abosaveve' }
  | PRINT { $$ = `this.output('inline')` }
  | GRAPH { $$ = `this.output('linegraph')` }
  | HIST { $$ = `this.output('histogram')` }
  | LOG { $$ = 'this.log' }
  ;
  
