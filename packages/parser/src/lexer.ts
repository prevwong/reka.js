import {
  tc_component,
  tc_component_tmpl,
  tc_element_open_tag,
  tc_element_expr,
} from './context';
import { State } from './state';
import { KEYWORDS, Token, TokenType } from './tokens';

export class Lexer {
  protected source: string;
  protected declare state: State;

  constructor(source: string) {
    this.source = source;
    this.state = new State();
    this.source = this.source.replace(/\s+$/, '');
  }

  parse() {
    this.next();
  }

  get currentToken() {
    return this.state.currentToken;
  }

  get previousToken() {
    return this.state.previousToken;
  }

  check(tokenType: TokenType) {
    if (!this.state.currentToken) {
      return false;
    }

    return this.state.currentToken.type === tokenType;
  }

  match(tokenType: TokenType) {
    if (this.check(tokenType)) {
      this.next();
      return true;
    }

    return false;
  }

  consume(tokenType: TokenType) {
    if (!this.match(tokenType)) {
      this.error(
        `Unexpected token. Expected ${tokenType}, but received ${JSON.stringify(
          this.state.currentToken
        )}`
      );
    }

    return this.previousToken;
  }

  next() {
    this.advanceWhitespace();
    this.state.start = this.state.current;

    if (this.isAtEnd()) {
      return this.tokenize(TokenType.EOF);
    }

    const c = this.advanceChar();

    if (this.isNumeric(c)) {
      return this.readNumber();
    }

    if (this.isIdentifier(c)) {
      return this.readIdentifier();
    }

    switch (c) {
      case '(': {
        if (
          this.currentToken?.type === TokenType.ARROW &&
          this.currentContext === tc_component
        ) {
          return this.tokenize(TokenType.COMPONENT_TMPL_START);
        }
        return this.tokenize(TokenType.LPAREN);
      }
      case ')': {
        if (this.currentContext === tc_component_tmpl) {
          return this.tokenize(TokenType.COMPONENT_TMPL_END);
        }
        return this.tokenize(TokenType.RPAREN);
      }
      case '{': {
        if (
          this.currentContext === tc_component_tmpl ||
          this.currentContext === tc_element_open_tag
        ) {
          return this.tokenize(TokenType.ELEMENT_EXPR_START);
        }

        return this.tokenize(TokenType.LBRACE);
      }
      case '}': {
        if (this.currentContext === tc_element_expr) {
          return this.tokenize(TokenType.ELEMENT_EXPR_END);
        }
        return this.tokenize(TokenType.RBRACE);
      }
      case '=': {
        if (this.matchChar('>')) {
          return this.tokenize(TokenType.ARROW);
        } else if (this.matchChar('=')) {
          return this.tokenize(TokenType.EQEQ);
        }

        return this.tokenize(TokenType.EQ);
      }
      case '<': {
        if (
          this.currentContext === tc_component_tmpl ||
          this.currentContext === tc_element_open_tag
        ) {
          return this.tokenize(TokenType.ELEMENT_TAG_START);
        }

        if (this.matchChar('=')) {
          return this.tokenize(TokenType.LEQ);
        }

        return this.tokenize(TokenType.LT);
      }
      case '>': {
        if (this.currentContext === tc_element_open_tag) {
          return this.tokenize(TokenType.ELEMENT_TAG_END);
        }
        if (this.matchChar('=')) {
          return this.tokenize(TokenType.GEQ);
        }

        return this.tokenize(TokenType.GT);
      }
      case '/': {
        return this.tokenize(TokenType.SLASH);
      }
      case '"': {
        this.advanceCharWhile((c) => c !== '"');
        this.state.start += 1;
        const string = this.tokenize(TokenType.STRING);
        this.state.current += 1;
        return string;
      }
      case ';': {
        return this.tokenize(TokenType.SEMICOLON);
      }
      case '@': {
        if (this.currentContext === tc_element_open_tag) {
          this.state.start += 1;
          this.advanceCharWhile((c) => this.isAlpha(c));
          const word = this.readWord();

          if (['if', 'each', 'classList'].includes(word) === false) {
            throw new Error(`Unknown element directive: ${word}`);
          }

          return this.tokenize(TokenType.ELEMENT_DIRECTIVE);
        }
        break;
      }
      case '$': {
        return this.tokenize(TokenType.DOLLAR);
      }
      case ',': {
        return this.tokenize(TokenType.COMMA);
      }
      case '[': {
        return this.tokenize(TokenType.LBRACKET);
      }
      case ']': {
        return this.tokenize(TokenType.RBRACKET);
      }
      case '+': {
        return this.tokenize(TokenType.PLUS);
      }
      case '-': {
        return this.tokenize(TokenType.MINUS);
      }
      case '*': {
        return this.tokenize(TokenType.STAR);
      }
      default: {
        this.error(`Unknown token type "${c}"`);
      }
    }
  }

  error(message: string) {
    const pos = this.state.getCurrentPos();
    const err = new SyntaxError(`[L${pos.line}:${pos.column}]: ${message}`);
    throw err;
  }

  private readIdentifier() {
    this.advanceCharWhile((c) => c === '$' || this.isAlphaNumeric(c));

    const word = this.readWord();

    const keyword = KEYWORDS[word];
    if (keyword) {
      return this.tokenize(keyword);
    }

    if (this.currentContext === tc_element_open_tag) {
      return this.tokenize(TokenType.ELEMENT_PROPERTY);
    }

    return this.tokenize(TokenType.IDENTIFIER);
  }

  private readNumber() {
    this.advanceInt();

    if (this.matchChar('.')) {
      this.advanceInt();
    }

    return this.tokenize(TokenType.NUMBER, (str) => parseFloat(str));
  }

  private readWord() {
    return this.source.slice(this.state.start, this.state.current);
  }

  private tokenize(
    type: TokenType,
    formatValue: (str: string) => any = (str) => str
  ) {
    this.state.previousToken = this.state.currentToken;
    this.state.currentToken = new Token(
      type,
      this.state.start,
      formatValue(this.readWord())
    );

    this.updateContext();
    return this.state.currentToken;
  }

  private updateContext() {
    switch (this.state.currentToken?.type) {
      case TokenType.COMPONENT: {
        this.state.addContext(tc_component);
        break;
      }
      case TokenType.COMPONENT_TMPL_START: {
        this.state.addContext(tc_component_tmpl);
        break;
      }
      case TokenType.COMPONENT_TMPL_END: {
        this.state.popContext();
        this.state.popContext();
        break;
      }
      case TokenType.ELEMENT_TAG_START: {
        this.state.addContext(tc_element_open_tag);
        break;
      }
      case TokenType.ELEMENT_TAG_END: {
        this.state.popContext();
        break;
      }
      case TokenType.ELEMENT_EXPR_START: {
        this.state.addContext(tc_element_expr);
        break;
      }
      case TokenType.ELEMENT_EXPR_END: {
        this.state.popContext();
        break;
      }
    }
  }

  private advanceInt() {
    this.advanceCharWhile((c) => this.isNumeric(c));
  }

  private advanceWhitespace() {
    this.advanceCharWhile((c) => {
      if (c === ' ' || c === '\r' || c === '\t' || c === '\n') {
        if (c === '\n') {
          this.state.nextLine();
        }
        return true;
      }

      return false;
    });
  }

  private advanceCharWhile(condition: (char: string) => boolean) {
    while (true) {
      if (!condition(this.peekChar())) {
        break;
      }

      if (this.isAtEnd()) {
        throw new Error(`Unterminated`);
      }

      this.advanceChar();
    }
  }

  private advanceChar() {
    if (!this.isAtEnd()) {
      this.state.current += 1;
    }

    return this.prevChar();
  }

  private matchChar(char: string) {
    if (this.peekChar() === char) {
      this.advanceChar();
      return char;
    }

    return null;
  }

  private peekChar() {
    if (this.isAtEnd()) {
      return '\0';
    }
    return this.source[this.state.current];
  }

  private prevChar() {
    return this.source[this.state.current - 1];
  }

  private isAtEnd() {
    return this.state.current === this.source.length;
  }

  private isIdentifier(c: string) {
    return this.isAlpha(c) || c === '$';
  }

  private isAlpha(c: string) {
    const code = c.charCodeAt(0);

    if ((code > 64 && code < 91) || (code > 96 && code < 123)) {
      return true;
    }

    return false;
  }

  private isNumeric(c: string) {
    const code = c.charCodeAt(0);

    if (code > 47 && code < 58) {
      return true;
    }

    return false;
  }

  private isAlphaNumeric(c: string) {
    return this.isAlpha(c) || this.isNumeric(c);
  }

  get currentContext() {
    return this.state.getCurrentContext();
  }
}
