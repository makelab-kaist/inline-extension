/* description: Parses SwitchBoard commands in cpp filess. */

/* lexical grammar */
%lex
%%

<<EOF>>                                           { return 'NONE' }
\s+                                               { /* ignore spaces */ }
'assert'                                          { return 'ASSERT' }
'is'                                              { return 'IS' }
'above'                                           { return 'ABOVE' }
'below'                                           { return 'BELOW' }
'between'                                         { return 'BETWEEN' }
'filter'                                          { return 'FILTER' }
'save'                                            { return 'SAVE' }
'print'                                           { return 'PRINT' }
'graph'                                           { return 'GRAPH' }
'hist'                                            { return 'HIST' }
'log'                                             { return 'LOG' }
'map'                                             { return 'LAMBDA' }
[^|]+                                             { return 'EXP' }
'|'                                               { return 'THEN' }



/lex


%start result

%% /* language grammar */


result
  : NONE { return `this.pipe(this.output(\\'inline\\')())(\$\$)`} // Nothing passed => pass the default. $$ has to be escaped in jison
  | primary_expression NONE { return $1.trim() }
  ;

primary_expression
  : EXP { $$ = `this.pipe(this.output(\\'inline\\')())(${$1})` }
  | output_functions { $$ = `this.pipe(${$1})(\$\$)` }
  | EXP THEN output_functions { $$ = `this.pipe(${$3})(${$1})` }
  | EXP THEN function_sequence { $$ = `this.pipe(${$3},this.output(\\'inline\\')())(${$1})` }
  | EXP THEN function_sequence THEN output_functions { $$ = `this.pipe(${$3},${$5})(${$1})` }
  | function_sequence { $$ = `this.pipe(${$1},this.output(\\'inline\\')())(\$\$)` } // $$ has to be escaped in jison
  | function_sequence THEN output_functions{ $$ = `this.pipe(${$1},${$3})(\$\$)` } // $$ has to be escaped in jison
  ;

function_sequence 
  : function_call {$$ = $1 }
  | function_sequence THEN function_call { $$ = $1 + ',' + $3 }
  ;

function_call
  : assert_function { $$ = $1 }
  | is_function { $$ = $1 }
  | threshold_functions { $$ = $1 }
  | filter_function { $$ = $1 }
  | save_function { $$ = $1 }
  | log_function { $$ = $1 }
  | lambda_function { $$ = $1 }
  ;


// Builtin functions

assert_function
  : ASSERT { $$ = 'this.assert' }
  ;

is_function
  : IS EXP { $$ = `this.is(${$2})` }
  ;

threshold_functions
  : ABOVE EXP { $$ = `this.above(${$2})` }
  | BELOW EXP { $$ = `this.below(${$2})` }
  | BETWEEN list { $$ = `this.between(${$2})` }
  ;

filter_function
  : FILTER { $$ = 'this.filter()' }
  | FILTER EXP { $$ = `this.filter(${$2})` } 
  ;

save_function
  : SAVE EXP { $$ = `this.save(\\'${$2}\\')` }
  ;

log_function
  : LOG { $$ = `this.log()` }
  | LOG EXP { $$ = `this.log(\\'${$2}\\')` }
  ;

lambda_function
  : LAMBDA EXP { $$= `this.lambda(${$2})`}
  ;

// must be at the end. Default is print
output_functions
  : PRINT { $$ = `this.output(\\'inline\\')()` }
  | PRINT list { $$ = `this.output(\\'inline\\')(${$2})` }
  | GRAPH { $$ = `this.output(\\'linegraph\\')()` }
  | GRAPH list { $$ = `this.output(\\'linegraph\\')(${$2})` }
  | HIST { $$ = `this.output(\\'histogram\\')()` }
  | HIST list{ $$ = `this.output(\\'histogram\\')(${$2})` }
  ;

list
  : EXP  { $$ = $1 }
  | list ',' EXP { $$ = $1 + ',' + $2 }
  ;