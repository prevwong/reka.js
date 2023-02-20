import * as b from '@babel/types';
import * as t from '@rekajs/types';
import { invariant, safeObjKey } from '@rekajs/utils';
import acorn, { Parser as AcornParser } from 'acorn';
import jsx from 'acorn-jsx';

import { Lexer } from './lexer';
import { Stringifier } from './stringifier';
import { TokenType } from './tokens';
import { getIdentifierFromStr } from './utils';

const parseWithAcorn = (source: string, loc: number) => {
  const JSXParser = AcornParser.extend(jsx());

  return JSXParser.parseExpressionAt(source, loc, {
    ecmaVersion: 2020,
  }) as b.Node & acorn.Node;
};

type AcornParserOptions<T extends t.Type = t.Any> = {
  expectedType?: t.TypeConstructor<T>;
  isElementEachDirective?: boolean;
};

const parseExpressionWithAcornToRekaType = <T extends t.Type = t.Any>(
  source: string,
  loc: number,
  opts?: AcornParserOptions<T>
) => {
  // Bootstrapping on acorn's parser for parsing basic expressions
  const expression = parseWithAcorn(source, loc);

  const type = jsToReka(expression as unknown as b.Node, opts);

  return { expression, type };
};

const jsToReka = <T extends t.Type = t.Any>(
  node: b.Node,
  opts?: AcornParserOptions<T>
) => {
  const _convert = (node: b.Node) => {
    switch (node.type) {
      case 'BlockStatement': {
        return t.block({
          statements: node.body.map((b) => _convert(b)),
        });
      }
      case 'AssignmentExpression': {
        return t.assignment({
          left: _convert(node.left),
          operator: node.operator as any,
          right: _convert(node.right),
        });
      }
      case 'VariableDeclaration': {
        return t.val({
          name: (node.declarations[0].id as b.Identifier).name,
          init: node.declarations[0].init
            ? _convert(node.declarations[0].init)
            : undefined,
        });
      }
      case 'Identifier': {
        return getIdentifierFromStr(node.name);
      }
      case 'ExpressionStatement': {
        return _convert(node.expression);
      }
      case 'ArrowFunctionExpression': {
        return t.func({
          params: node.params.map((p) => _convert(p)),
          body: _convert(node.body as b.BlockStatement),
        });
      }
      case 'ArrayExpression': {
        return t.arrayExpression({
          elements: node.elements.map((p) => p && _convert(p)),
        });
      }
      case 'ObjectExpression': {
        return t.objectExpression({
          properties: node.properties.reduce((accum, property: any) => {
            let key: string;

            if (property.key.type === 'Literal') {
              key = property.key.value;
            } else {
              key = property.key.name;
            }

            return {
              ...accum,
              [`${safeObjKey(key)}`]: _convert(property.value),
            };
          }, {}),
        });
      }
      case 'CallExpression': {
        const identifier = _convert(node.callee) as t.Identifier;

        let params: Record<string, t.Expression> = {};

        const arg0 = node.arguments[0];

        if (arg0) {
          const objExpr = _convert(arg0);
          invariant(
            objExpr instanceof t.ObjectExpression,
            'Invalid options argument'
          );

          params = objExpr.properties;
        }

        return t.callExpression({
          identifier,
          params,
        });
      }
      case 'IfStatement': {
        return t.ifStatement({
          condition: _convert(node.test),
          consequent: _convert(node.consequent),
        });
      }
      case 'ConditionalExpression': {
        return t.conditionalExpression({
          condition: _convert(node.test),
          consequent: _convert(node.consequent),
          alternate: _convert(node.alternate),
        });
      }
      case 'BinaryExpression': {
        if (node.operator === 'in' && opts?.isElementEachDirective) {
          let alias: t.Identifier;
          let index: t.Identifier | undefined;

          if (b.isIdentifier(node.left)) {
            alias = _convert(node.left);
          } else if (b.isSequenceExpression(node.left)) {
            b.assertIdentifier(node.left.expressions[0]);
            b.assertIdentifier(node.left.expressions[1]);

            alias = _convert(node.left.expressions[0]);
            index = _convert(node.left.expressions[1]);
          } else {
            throw new Error(
              'Unexpected left hand side input for constructing ElementEach type'
            );
          }

          return t.elementEach({
            alias,
            index,
            iterator: _convert(node.right),
          });
        }

        return t.binaryExpression({
          left: _convert(node.left),
          operator: node.operator as any,
          right: _convert(node.right),
        });
      }
      case 'JSXElement': {
        const identifier = node.openingElement.name;
        invariant(b.isJSXIdentifier(identifier), 'Invalid JSX identifier');

        const identifierName = identifier.name;

        const isComponent =
          identifierName[0] === identifierName[0].toUpperCase();

        const directives = {
          if: null,
          each: null,
          classList: null,
        };

        const props = node.openingElement.attributes.reduce((accum, attr) => {
          invariant(b.isJSXAttribute(attr), 'Invalid attribute');

          const attrName = attr.name.name;
          invariant(typeof attrName === 'string', 'Invalid attribute name');

          if (
            attrName.startsWith('@') &&
            Object.keys(directives).includes(attrName.substring(1))
          ) {
            directives[attrName.substring(1)] = attr.value
              ? _convert(attr.value)
              : null;

            return accum;
          }

          return {
            ...accum,
            [attrName]: attr.value ? _convert(attr.value) : undefined,
          };
        }, {});

        const children = node.children.map((child) => _convert(child));

        if (isComponent) {
          return t.componentTemplate({
            component: t.identifier({
              name: identifierName,
            }),
            props,
            children,
            ...directives,
          });
        }

        if (identifierName === 'slot') {
          return t.slotTemplate({
            props: {},
            children: [],
          });
        }

        return t.tagTemplate({
          tag: identifierName,
          props,
          children,
          ...directives,
        });
      }
      case 'JSXExpressionContainer': {
        return t.Schema.fromJSON(node.expression);
      }
      default: {
        return t.Schema.fromJSON(node) as t.Type;
      }
    }
  };

  const type = _convert(node) as t.Any;

  if (opts?.expectedType) {
    invariant(
      type instanceof opts.expectedType,
      `Parser return an unexpected type.`
    );
  }

  return type as T;
};

class _Parser extends Lexer {
  parse() {
    this.next();

    const globals: t.Val[] = [];
    const components: t.RekaComponent[] = [];

    while (this.check(TokenType.COMPONENT) || this.check(TokenType.VAL)) {
      if (this.check(TokenType.VAL)) {
        globals.push(this.parseVariableDecl());
        continue;
      }

      components.push(this.parseComponent());
    }

    this.parseDeclaration();

    return t.program({
      components,
      globals,
    });
  }

  private parseDeclaration() {
    const declarations: t.Val[] = [];
    while (this.check(TokenType.VAL)) {
      declarations.push(this.parseVariableDecl());
    }

    return declarations;
  }

  private parseVariableDecl() {
    this.consume(TokenType.VAL);
    const name = this.consume(TokenType.IDENTIFIER);
    this.consume(TokenType.EQ);
    const init = this.parseExpressionAt(this.currentToken.pos - 1) as any;
    this.consume(TokenType.SEMICOLON);

    return t.val({
      name: name.value,
      init,
    });
  }

  private parseComponent() {
    this.consume(TokenType.COMPONENT);

    const name = this.consume(TokenType.IDENTIFIER);

    this.consume(TokenType.LPAREN);

    const startToken = this.currentToken;

    while (!this.check(TokenType.RPAREN)) {
      if (this.check(TokenType.LPAREN)) {
        while (!this.check(TokenType.RPAREN)) {
          this.next();
        }
      }

      this.next();
    }

    const endToken = this.currentToken;

    const paramsStr = this.source.slice(startToken.pos, endToken.pos);

    const parsedDummyFn = parseWithAcorn(`function (${paramsStr}) {}`, 0);

    invariant(b.isFunctionExpression(parsedDummyFn), 'Not function expr');

    const props = parsedDummyFn.params.map((param) => {
      let init: t.Expression | undefined;
      let name: string;

      invariant(
        b.isAssignmentPattern(param) || b.isIdentifier(param),
        'Invalid component prop'
      );

      if (b.isAssignmentPattern(param)) {
        init = jsToReka(param.right, { expectedType: t.Expression });

        invariant(
          b.isIdentifier(param.left),
          'Invalid component prop assignment'
        );
        name = param.left.name;
      } else {
        name = param.name;
      }

      return t.componentProp({
        name,
        init,
      });
    });

    this.consume(TokenType.RPAREN);

    const state = this.parseComponentStateDeclaration();
    this.consume(TokenType.ARROW);
    this.consume(TokenType.COMPONENT_TMPL_START);
    const template = this.parseElement();
    this.consume(TokenType.COMPONENT_TMPL_END);

    return t.rekaComponent({
      name: name.value,
      state,
      props,
      template,
    });
  }

  private parseComponentStateDeclaration() {
    const state: t.Val[] = [];

    if (this.match(TokenType.LBRACE)) {
      while (!this.check(TokenType.RBRACE)) {
        state.push(this.parseVariableDecl());
      }
      this.consume(TokenType.RBRACE);
    }

    return state;
  }

  private parseElement() {
    this.consume(TokenType.ELEMENT_TAG_START);
    return this.parseElementContent();
  }

  private parseElementEach() {
    return this.parseElementExpr({
      expectedType: t.ElementEach,
      isElementEachDirective: true,
    });
  }

  private parseElementContent() {
    const children: t.Template[] = [];
    const props: Record<string, any> = {};

    let closingTag: string | null = null;

    const tag = this.consume(TokenType.ELEMENT_PROPERTY).value;

    const directives = {
      each: undefined,
      if: undefined,
    };

    while (
      !this.check(TokenType.ELEMENT_TAG_END) &&
      !this.check(TokenType.SLASH)
    ) {
      if (this.check(TokenType.ELEMENT_PROPERTY)) {
        const propName = this.consume(TokenType.ELEMENT_PROPERTY).value;
        this.consume(TokenType.EQ);

        let propValue;
        if (this.check(TokenType.STRING)) {
          const token = this.consume(TokenType.STRING);
          propValue = t.literal({
            value: token.value,
          });
        } else {
          propValue = this.parseElementExpr();
        }

        props[propName] = propValue;
      } else {
        const directive = this.consume(TokenType.ELEMENT_DIRECTIVE).value;
        this.consume(TokenType.EQ);
        const directiveValue =
          directive === 'each'
            ? this.parseElementEach()
            : this.parseElementExpr();

        directives[directive] = directiveValue;
      }
    }

    const selfClosing = this.match(TokenType.SLASH);

    this.consume(TokenType.ELEMENT_TAG_END);

    if (!selfClosing) {
      contents: for (;;) {
        switch (this.currentToken.type) {
          case TokenType.ELEMENT_TAG_START: {
            this.next();

            if (this.match(TokenType.SLASH)) {
              closingTag = this.consume(TokenType.ELEMENT_PROPERTY).value;
              this.consume(TokenType.ELEMENT_TAG_END);
              break contents;
            }

            children.push(this.parseElementContent());
            break;
          }
          case TokenType.ELEMENT_EXPR_START: {
            const expr = this.parseElementExpr();

            invariant(
              expr instanceof t.Literal,
              `Expected literal value as text value`
            );

            children.push(
              t.tagTemplate({
                tag: 'text',
                props: {
                  text: expr,
                },
                children: [],
              })
            );
            break;
          }
          default: {
            this.error('Unexpected token' + this.currentToken.type);
            break;
          }
        }
      }

      if (tag !== closingTag) {
        this.error(
          `Mismatched closing tag. Expected </${tag}> but got </${closingTag}> instead.`
        );
      }
    }

    const isComponent = tag[0] === tag[0].toUpperCase();

    if (isComponent) {
      return t.componentTemplate({
        component: getIdentifierFromStr(tag),
        props,
        children,
        ...directives,
      });
    }

    if (tag === 'slot') {
      return t.slotTemplate({
        props: {},
        children: [],
      });
    }

    return t.tagTemplate({
      tag,
      props,
      children,
      ...directives,
    });
  }

  private parseElementExpr<T extends t.Type>(opts?: AcornParserOptions<T>) {
    this.consume(TokenType.ELEMENT_EXPR_START);
    const expr = this.parseExpressionAt(this.previousToken.pos + 1, opts);
    this.consume(TokenType.ELEMENT_EXPR_END);
    return expr;
  }

  private parseExpressionAt<T extends t.Type = t.Any>(
    loc: number,
    opts?: AcornParserOptions<T>
  ) {
    const { expression, type } = parseExpressionWithAcornToRekaType(
      this.source,
      loc,
      opts
    );

    // Since we're using acorn to parse the expression
    // Move the lexer to the end of the expression
    this.state.current = expression.end;
    this.next();

    return type;
  }
}

/**
 * A singleton that exposes parsing utilities
 */
export class Parser {
  /// Parse source into a Reka Program AST node
  static parseProgram(source: string) {
    return new _Parser(source).parse();
  }

  /// Parse an expression string into a Expression AST node
  static parseExpression<T extends t.Type = t.Any>(
    source: string,
    expectedType?: t.TypeConstructor<T>
  ) {
    const { type } = parseExpressionWithAcornToRekaType(`{${source}}`, 1, {
      expectedType,
    });

    return type as T;
  }

  /// Stringify an AST Node into code
  static stringify(type: t.Any) {
    return Stringifier.toString(type);
  }
}
