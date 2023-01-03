import * as b from '@babel/types';
import * as t from '@composite/types';
import { ecscapeObjKey } from '@composite/types';
import acorn, { parseExpressionAt } from 'acorn';
import invariant from 'tiny-invariant';

import { Lexer } from './lexer';
import { Stringifier } from './stringifier';
import { TokenType } from './tokens';

const parseWithAcorn = (source: string, loc: number) => {
  return parseExpressionAt(source, loc, {
    ecmaVersion: 2020,
  }) as b.Node & acorn.Node;
};

const parseExpressionWithAcornToCompositeType = <T extends t.Type = t.Any>(
  source: string,
  loc: number,
  expectedType?: t.TypeConstructor<T>
) => {
  // Bootstrapping on acorn's parser for parsing basic expressions
  const expression = parseWithAcorn(source, loc);
  const type = jsToComposite(expression as unknown as b.Node, expectedType);

  return { expression, type };
};

const jsToComposite = <T extends t.Type = t.Any>(
  node: b.Node,
  expectedType?: t.TypeConstructor<T>
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
        return t.identifier({
          name: node.name,
        });
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
              [`${ecscapeObjKey(key)}`]: _convert(property.value),
            };
          }, {}),
        });
      }
      case 'CallExpression': {
        const identifier = _convert(node.callee) as t.Identifier;

        if (identifier.name.startsWith('$')) {
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

          return t.externalGlobal({
            name: identifier.name.substring(1),
            params,
          });
        }

        return t.callExpression({
          identifier,
          arguments: node.arguments.map((arg) => _convert(arg)),
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
        return t.binaryExpression({
          left: _convert(node.left),
          operator: node.operator as any,
          right: _convert(node.right),
        });
      }
      default: {
        return t.Schema.fromJSON(node) as t.Type;
      }
    }
  };

  const type = _convert(node) as t.Any;

  if (expectedType) {
    invariant(
      type instanceof expectedType,
      `Parser return an unexpected type.`
    );
  }

  return type as T;
};

class _Parser extends Lexer {
  parse() {
    this.next();

    const globals: t.Val[] = [];
    const components: t.CompositeComponent[] = [];

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
        init = jsToComposite(param.right, t.Expression);

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

    return t.compositeComponent({
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
    let index: t.Identifier | undefined, alias: t.Identifier;

    this.consume(TokenType.ELEMENT_EXPR_START);
    if (this.check(TokenType.LPAREN)) {
      this.consume(TokenType.LPAREN);
      alias = t.identifier({
        name: this.consume(TokenType.IDENTIFIER).value,
      });
      this.consume(TokenType.COMMA);
      index = t.identifier({
        name: this.consume(TokenType.IDENTIFIER).value,
      });
      this.consume(TokenType.RPAREN);
    } else {
      alias = t.identifier({
        name: this.consume(TokenType.IDENTIFIER).value,
      });
    }

    this.consume(TokenType.IN);

    const iterator = t.identifier({
      name: this.consume(TokenType.IDENTIFIER).value,
    });

    this.consume(TokenType.ELEMENT_EXPR_END);

    return t.elementEach({
      index,
      alias,
      iterator,
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
        component: t.identifier({ name: tag }),
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

  private parseElementExpr() {
    this.consume(TokenType.ELEMENT_EXPR_START);
    const expr = this.parseExpressionAt(this.previousToken.pos + 1);
    this.consume(TokenType.ELEMENT_EXPR_END);
    return expr;
  }

  private parseExpressionAt<T extends t.Type = t.Any>(
    loc: number,
    expectedType?: t.TypeConstructor<T>
  ) {
    const { expression, type } = parseExpressionWithAcornToCompositeType(
      this.source,
      loc,
      expectedType
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
  /// Parse source into a Composite Program AST node
  static parse(source: string) {
    return new _Parser(source).parse();
  }

  /// Parse an expression string into a Expression AST node
  static parseExpressionFromSource<T extends t.Type = t.Any>(
    source: string,
    expectedType?: t.TypeConstructor<T>
  ) {
    const { type } = parseExpressionWithAcornToCompositeType(
      `{${source}}`,
      1,
      expectedType
    );

    return type as T;
  }

  /// Stringify an AST Node into code
  static stringify(type: t.Any) {
    return Stringifier.toString(type);
  }
}
