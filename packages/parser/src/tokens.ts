export enum TokenType {
  LPAREN = '(',
  RPAREN = ')',
  LBRACE = '{',
  RBRACE = '}',
  LBRACKET = '[',
  RBRACKET = ']',
  COMMA = ',',
  DOT = '.',
  MINUS = '-',
  UNDERSCORE = '_',
  PLUS = '+',
  COLON = ':',
  SEMICOLON = ';',
  SLASH = '/',
  STAR = '*',
  DOLLAR = '$',
  AMPERSAND = '@',
  BACKTICK = '`',

  NOT = '!',
  NEQ = '!=',
  EQ = '=',
  EQEQ = '==',
  ARROW = '=>',
  GT = '>',
  GEQ = '>=',
  LT = '<',
  LEQ = '<=',

  IDENTIFIER = 'identifier',
  STRING = 'string',
  NUMBER = 'number',
  FUNC = 'func',

  KIND = 'kind',
  KIND_TYPE = 'kind_type',
  KIND_PARAM_START = 'kind_param_start',
  KIND_PARAM_END = 'kind_param_end',

  IF = 'if',
  IN = 'in',
  ELSE = 'else',
  NULL = 'null',
  TRUE = 'true',
  FALSE = 'false',
  VAL = 'val',
  OR = '|',
  AND = '&',
  RETURN = 'return',
  RENDER = 'render',
  COMPONENT = 'component',

  COMPONENT_TMPL_START = 'component_tmpl_start',
  COMPONENT_TMPL_END = 'component_tmpl_end',
  ELEMENT_TAG_START = 'element_tag_start',
  ELEMENT_TAG_END = 'element_tag_end',
  ELEMENT_PROPERTY = 'element_property',
  ELEMENT_EXPR_START = 'element_expr_start',
  ELEMENT_EXPR_END = 'element_expr_end',
  ELEMENT_DIRECTIVE = 'element_directive',

  ERROR = 'error',
  EOF = 'eof',
}

export const KEYWORDS = {
  if: TokenType.IF,
  else: TokenType.ELSE,
  return: TokenType.RETURN,
  component: TokenType.COMPONENT,
  val: TokenType.VAL,
  in: TokenType.IN,
};

export class Token {
  type: TokenType;
  value: any;
  pos: number;

  constructor(type: TokenType, pos: number, value?: any) {
    this.type = type;
    this.value = value;
    this.pos = pos;
  }
}
