import * as b from '@babel/types';
import * as t from '@composite/types';
import { parseExpressionAt } from 'acorn';

import { Lexer } from './lexer';
import { TokenType } from './tokens';

export const jsToComposite = (node: b.Node) => {
  switch (node.type) {
    case 'BlockStatement': {
      return t.block({
        statements: node.body.map((b) => jsToComposite(b)),
      });
    }
    case 'AssignmentExpression': {
      return t.assignment({
        left: jsToComposite(node.left),
        operator: node.operator as any,
        right: jsToComposite(node.right),
      });
    }
    case 'VariableDeclaration': {
      return t.val({
        name: (node.declarations[0].id as b.Identifier).name,
        init: node.declarations[0].init
          ? jsToComposite(node.declarations[0].init)
          : undefined,
      });
    }
    case 'Identifier': {
      return t.identifier({
        name: node.name,
      });
    }
    case 'ExpressionStatement': {
      return jsToComposite(node.expression);
    }
    case 'ArrowFunctionExpression': {
      return t.func({
        params: node.params.map((p) => jsToComposite(p)),
        body: jsToComposite(node.body as b.BlockStatement),
      });
    }
    case 'ArrayExpression': {
      return t.arrayExpression({
        elements: node.elements.map((p) => p && jsToComposite(p)),
      });
    }
    case 'ObjectExpression': {
      return t.objectExpression({
        properties: node.properties.reduce((accum, property: any) => {
          return {
            ...accum,
            [(property.key as any).name]: jsToComposite(property.value),
          };
        }, {}),
      });
    }
    default: {
      return t.Schema.fromJSON(node);
    }
  }
};
export class Parser extends Lexer {
  parse(source: string) {
    super.parse(source);

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

  parseDeclaration() {
    const declarations: t.Val[] = [];
    while (this.check(TokenType.VAL)) {
      declarations.push(this.parseVariableDecl());
    }

    return declarations;
  }

  parseVariableDecl() {
    this.consume(TokenType.VAL);
    const name = this.consume(TokenType.IDENTIFIER);
    this.consume(TokenType.EQ);
    const init = this.parseExpressionAt(this.currentToken.pos - 1);
    this.consume(TokenType.SEMICOLON);

    return t.val({
      name: name.value,
      init,
    });
  }

  parseIdentifier() {
    const identifier = this.consume(TokenType.IDENTIFIER).value;

    return t.identifier({
      name: identifier,
    });
  }

  parseComponent() {
    this.consume(TokenType.COMPONENT);

    const name = this.consume(TokenType.IDENTIFIER);

    this.consume(TokenType.LPAREN);
    const props: t.ComponentProp[] = [];
    while (!this.check(TokenType.RPAREN)) {
      props.push(
        t.componentProp({
          name: this.consume(TokenType.IDENTIFIER).value,
        })
      );

      this.match(TokenType.COMMA);
    }
    this.consume(TokenType.RPAREN);
    // let state = [];
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

  parseComponentStateDeclaration() {
    const state: t.Val[] = [];

    this.consume(TokenType.LBRACE);
    while (!this.check(TokenType.RBRACE)) {
      state.push(this.parseVariableDecl());
    }
    this.consume(TokenType.RBRACE);

    return state;
  }

  parseElement() {
    this.consume(TokenType.ELEMENT_TAG_START);
    return this.parseElementContent();
  }

  parseExpression() {
    if (this.check(TokenType.ELEMENT_TAG_START)) {
      return this.parseElement();
    }

    return this.parseExpressionAt(this.state.currentToken.pos - 1);
  }

  parseElementEach() {
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

  parseElementExpr() {
    this.consume(TokenType.ELEMENT_EXPR_START);
    const expr = this.parseExpressionAt(this.previousToken.pos + 1);
    this.consume(TokenType.ELEMENT_EXPR_END);
    return expr;
  }

  parseExpressionFromSource(source: string) {
    super.parse(source);

    return this.parseExpressionAt(
      this.state.currentToken.pos + 1
    ) as t.Expression;
  }

  private parseExpressionAt(loc: number) {
    // Bootstrapping on acorn's parser for parsing basic expressions
    const expression = parseExpressionAt(this.source, loc, {
      ecmaVersion: 2020,
    });

    // Since we're using acorn to parse the expression
    // Move the lexer to the end of the expression
    this.state.current = expression.end;
    this.next();

    return jsToComposite(expression as unknown as b.Node);
  }
}
