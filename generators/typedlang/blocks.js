/**
 * @fileoverview Generating TypedLang for logic blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.TypedLang.blocks');

goog.require('Blockly.TypedLang');

Blockly.TypedLang['logic_boolean_typed'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['logic_compare_typed'] = function(block) {
  // Comparison operator.
  var OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = (operator == '==' || operator == '!=') ?
      Blockly.TypedLang.ORDER_EQUALITY : Blockly.TypedLang.ORDER_RELATIONAL;
  var argument0 = Blockly.TypedLang.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.TypedLang.valueToCode(block, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.TypedLang['logic_ternary_typed'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.TypedLang.valueToCode(block, 'IF',
      Blockly.TypedLang.ORDER_CONDITIONAL) || 'false';
  var value_then = Blockly.TypedLang.valueToCode(block, 'THEN',
      Blockly.TypedLang.ORDER_CONDITIONAL) || 'null';
  var value_else = Blockly.TypedLang.valueToCode(block, 'ELSE',
      Blockly.TypedLang.ORDER_CONDITIONAL) || 'null';
  var code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, Blockly.TypedLang.ORDER_CONDITIONAL];
};

Blockly.TypedLang['int_typed'] = function(block) {
  // int value.
  var code = parseInt(block.getFieldValue('INT'));
  var order = code >= 0 ? Blockly.TypedLang.ORDER_ATOMIC :
              Blockly.TypedLang.ORDER_UNARY_NEGATION;
  return [code, order];
};

Blockly.TypedLang['int_arithmetic_typed'] = function(block) {
  // Basic arithmetic operators
  var OPERATORS = {
    'ADD_INT': [' + ', Blockly.TypedLang.ORDER_ADDITION],
    'MINUS_INT': [' - ', Blockly.TypedLang.ORDER_SUBTRACTION],
    'MULTIPLY_INT': [' * ', Blockly.TypedLang.ORDER_MULTIPLICATION],
    'DIVIDE_INT': [' / ', Blockly.TypedLang.ORDER_DIVISION]
  };
  var tuple = OPERATORS[block.getFieldValue('OP_INT')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.TypedLang.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.TypedLang.valueToCode(block, 'B', order) || '0';
  var code;
  code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.TypedLang['float_typed'] = function(block) {
  // float value.
  var code = block.getFieldValue('FLOAT');
  var order = code >= 0 ? Blockly.TypedLang.ORDER_ATOMIC :
              Blockly.TypedLang.ORDER_UNARY_NEGATION;
  return [code, order];
};

Blockly.TypedLang['float_arithmetic_typed'] = function(block) {
  // Basic arithmetic operators
  var OPERATORS = {
    'ADD_FLOAT': [' +. ', Blockly.TypedLang.ORDER_ADDITION],
    'MINUS_FLOAT': [' -. ', Blockly.TypedLang.ORDER_SUBTRACTION],
    'MULTIPLY_FLOAT': [' *. ', Blockly.TypedLang.ORDER_MULTIPLICATION],
    'DIVIDE_FLOAT': [' /. ', Blockly.TypedLang.ORDER_DIVISION]
  };
  var tuple = OPERATORS[block.getFieldValue('OP_FLOAT')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.TypedLang.valueToCode(block, 'A', order) || '0.';
  var argument1 = Blockly.TypedLang.valueToCode(block, 'B', order) || '0.';
  var code;
  code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.TypedLang['lists_create_with_typed'] = function(block) {
  // Create a list with any number of elements of any type.
  var elements = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    elements[i] = Blockly.TypedLang.valueToCode(block, 'ADD' + i,
        Blockly.TypedLang.ORDER_COMMA) || 'null';
  }
  var code = '[' + elements.join(', ') + ']';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['pair_create_typed'] = function(block) {
  var fst = Blockly.TypedLang.valueToCode(block, 'FIRST',
      Blockly.TypedLang.ORDER_ATOMIC);
  var snd = Blockly.TypedLang.valueToCode(block, 'SECOND',
      Blockly.TypedLang.ORDER_ATOMIC);
  var code = '(' + fst + snd + ')';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['pair_first_typed'] = function(block) {
  var arg = Blockly.TypedLang.valueToCode(block, 'FIRST',
      Blockly.TypedLang.ORDER_ATOMIC);
  var code = 'fst (' + arg + ')';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['pair_second_typed'] = function(block) {
  var arg = Blockly.TypedLang.valueToCode(block, 'SECOND',
      Blockly.TypedLang.ORDER_ATOMIC);
  var code = 'snd (' + arg + ')';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['lambda_typed'] = function(block) {
  var varname = block.typedValue['VAR'].getVariableName();
  var body = Blockly.TypedLang.valueToCode(block, 'RETURN',
      Blockly.TypedLang.ORDER_ATOMIC);
  var code = 'fun ' + varname + ' -> ' + body;
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['lambda_app_typed'] = function(block) {
  var left = Blockly.TypedLang.valueToCode(block, 'FUN',
      Blockly.TypedLang.ORDER_ATOMIC);
  var right = Blockly.TypedLang.valueToCode(block, 'ARG',
      Blockly.TypedLang.ORDER_ATOMIC);
  var code = left + ' ' + right;
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['match_typed'] = function(block) {
  var input = Blockly.TypedLang.valueToCode(block, 'INPUT',
      Blockly.TypedLang.ORDER_ATOMIC);
  var patt1 = Blockly.TypedLang.valueToCode(block, 'PATTERN1',
      Blockly.TypedLang.ORDER_ATOMIC);
  var patt2 = Blockly.TypedLang.valueToCode(block, 'PATTERN2',
      Blockly.TypedLang.ORDER_ATOMIC);
  var out1 = Blockly.TypedLang.valueToCode(block, 'OUTPUT1',
      Blockly.TypedLang.ORDER_ATOMIC);
  var out2 = Blockly.TypedLang.valueToCode(block, 'OUTPUT2',
      Blockly.TypedLang.ORDER_ATOMIC);
  var code = 'match ' + input + ' with\n' +
    '  | ' + patt1 + ' -> ' + out1 + '\n' +
    '  | ' + patt2 + ' -> ' + out2 + '\n';
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['variables_get_typed'] = function(block) {
  var varname = block.typedValue['VAR'].getVariableName();
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['let_typed'] = function(block) {
  var args = [];
  for (var i = 0; i < block.argumentCount_; i++) {
    var argn = 'ARG' + i;
    var val = block.typedValue[argn];
    args.push(val.getVariableName());
  }
  var varname = block.typedValue['VAR'].getVariableName();
  var arg = args.length == 0 ? '' : ' ' + args.join(' ');
  var exp1 = Blockly.TypedLang.valueToCode(block, 'EXP1',
      Blockly.TypedLang.ORDER_ATOMIC);
  var exp2 = Blockly.TypedLang.valueToCode(block, 'EXP2',
      Blockly.TypedLang.ORDER_ATOMIC);

  var code = 'let ' + varname + arg + ' = ' + exp1 + ' in ' + exp2;
  return [code, Blockly.TypedLang.ORDER_ATOMIC];
};

Blockly.TypedLang['letrec_typed'] = function(block) {
  throw 'not implemented';
};