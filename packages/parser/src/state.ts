import { Token } from "./tokens";
import { TokContext } from "./context";
export class State {
  start: number;
  current: number;
  line: number;
  lineOffset: number;

  declare previousToken: Token;
  declare currentToken: Token;

  readonly context: TokContext[];

  constructor() {
    this.start = 0;
    this.current = 0;
    this.lineOffset = 0;
    this.line = 1;

    this.context = [];
  }

  nextLine() {
    this.line += 1;
    this.lineOffset = this.current;
  }

  updateToken(newToken: Token) {
    this.previousToken = this.currentToken;
    this.currentToken = newToken;
  }

  getCurrentPos() {
    return {
      line: this.line,
      column: this.current - this.lineOffset,
    };
  }

  getCurrentContext() {
    const ctx = this.context[this.context.length - 1];

    if (!ctx) {
      return null;
    }

    return ctx;
  }

  addContext(ctx: TokContext) {
    this.context.push(ctx);
  }

  popContext() {
    return this.context.pop();
  }
}
