import * as t from '@composite/types';
import invariant from 'tiny-invariant';

import { BinaryPrecedence, Precedence } from './precedence';

const mergeConsequtiveStrings = (arr) => {
  if (arr.length === 1) {
    return arr;
  }

  for (let i = arr.length - 1; i > 0; i--) {
    const current = arr[i];

    if (typeof current !== 'string') {
      continue;
    }

    if (current === '\n') {
      continue;
    }

    const prev = arr[i - 1];

    if (typeof prev !== 'string') {
      continue;
    }

    if (prev === '\n') {
      continue;
    }

    arr[i - 1] += current;
    arr.length--;
  }

  return arr;
};

function join(left, right) {
  if (left.length === 0) {
    return right;
  }

  if (right.length === 0) {
    return left;
  }

  return mergeConsequtiveStrings([...left, ' ', ...right]);
}

type WriterResult = Array<string | WriterResult>;

class Writer {
  base: string;
  indent: string;

  result: WriterResult = [];

  constructor() {
    this.base = '';
    this.indent = '    ';
  }

  newline() {
    this.result.push('\n');
  }

  write(str: string | Array<string> | WriterResult) {
    if (Array.isArray(str)) {
      this.result.push(...str);
      mergeConsequtiveStrings(this.result);
      return;
    }

    if (
      typeof this.result[this.result.length - 1] === 'string' &&
      this.result[this.result.length - 1] !== '\n' &&
      str !== '\n'
    ) {
      this.result[this.result.length - 1] += str;
      return;
    }

    this.result.push(str);
  }

  withIndent(
    cb: () => void,
    condition?: { test: () => boolean; wrap?: (cb: () => void) => void }
  ) {
    if (condition && !condition.test()) {
      if (condition.wrap) {
        condition.wrap(cb);
        return;
      }

      cb();

      return;
    }

    const prev = this.result;
    this.result = [];
    cb();
    if (this.result.length > 0) {
      prev.push(this.result);
    }
    this.result = prev;
  }

  withTemp(cb: () => void) {
    const prev = this.result;
    const temp = [];
    this.result = temp;
    cb();
    this.result = prev;
    return temp;
  }

  line(cb: () => void) {
    this.write('\n');
    cb();
    this.write('\n');
  }
}

class _Stringifier {
  writer: Writer = new Writer();

  toString(node: t.ASTNode) {
    this.stringify(node);

    let depth = 0;
    let str = ``;

    const _toString = (arr: WriterResult) => {
      for (let i = 0; i < arr.length; i++) {
        const c = arr[i];

        if (Array.isArray(c)) {
          const prev = depth;
          depth = depth + 1;
          str += '\n';
          _toString(c);
          str += '\n';
          depth = prev;
          continue;
        }

        if (c === '\n') {
          str += '\n';
          continue;
        }

        if (depth > 0) {
          for (let j = 0; j < depth; j++) {
            str += ' ';
          }
        }

        str += c;
      }

      depth -= 1;
    };

    _toString(this.writer.result);

    return str;
  }

  stringify(node: t.ASTNode, precedence: Precedence = Precedence.Sequence) {
    return t.match(node, {
      Literal: (node) => {
        if (typeof node.value === 'string') {
          this.writer.write(`"${node.value}"`);
          return;
        }

        this.writer.write(node.value.toString());
      },
      BinaryExpression: (node) => {
        let result;
        const currentPrecedence = BinaryPrecedence[node.operator];

        const leftPrecedence = currentPrecedence;
        const rightPrecedence = currentPrecedence + 1;

        const leftFragment = this.writer.withTemp(() => {
          this.stringify(node.left, leftPrecedence);
        });
        const rightFragment = this.writer.withTemp(() =>
          this.stringify(node.right, rightPrecedence)
        );

        result = join(leftFragment, [node.operator]);
        result = join(result, rightFragment);

        if (currentPrecedence < precedence) {
          this.writer.write('(');
          this.writer.write(result);
          this.writer.write(')');
          return;
        }

        this.writer.write(result);
      },
      MemberExpression: (node) => {
        this.stringify(node.object);
        this.writer.write('.');
        this.stringify(node.property);
      },
      ObjectExpression: (node) => {
        this.writer.write('{');
        this.writer.withIndent(() => {
          Object.keys(node.properties).forEach((property, i, arr) => {
            this.writer.write(`${property}: `);
            this.stringify(node.properties[property]);

            if (i !== arr.length - 1) {
              this.writer.write(',');
              this.writer.write('\n');
            }
          });
        });
        this.writer.write('}');
      },
      Func: (node) => {
        this.writer.write('(');
        node.params.forEach((param) => {
          this.stringify(param, precedence);
        });
        this.writer.write(') => ');
        this.stringify(node.body);
      },
      CallExpression: (node) => {
        this.stringify(node.identifier);
        this.writer.write('(');
        node.arguments.forEach((arg, i, arr) => {
          this.stringify(arg);
          if (i !== arr.length - 1) {
            this.writer.write(', ');
          }
        });
        this.writer.write(')');
      },
      ConditionalExpression: (node) => {
        this.stringify(node.condition);
        this.writer.write(' ? ');
        this.stringify(node.consequent);
        this.writer.write(' : ');
        this.stringify(node.alternate);
      },
      IfStatement: (node) => {
        this.writer.write(`if (`);
        this.stringify(node.condition);
        this.writer.write(') ');
        this.stringify(node.consequent);
      },
      Identifier: (node) => {
        this.writer.write(node.name);
      },
      Assignment: (node) => {
        const left = this.writer.withTemp(() =>
          this.stringify(node.left, Precedence.Call)
        );
        const right = this.writer.withTemp(() => this.stringify(node.right));

        const _write = () => {
          this.writer.write(left);
          this.writer.write(` ${node.operator} `);
          this.writer.write(right);
        };

        if (Precedence.Assignment < precedence) {
          this.writer.write('(');
          _write();
          this.writer.write(')');
          return;
        }

        _write();
      },
      Val: (node) => {
        this.writer.write(`val ${node.name}`);

        if (node.init) {
          this.writer.write(' = ');
          this.stringify(node.init);
        }
      },
      Block: (node) => {
        this.writer.write('{');
        this.writer.withIndent(() => {
          node.statements.forEach((statement, i, arr) => {
            this.stringify(statement);

            if (
              !(statement instanceof t.Block) &&
              !(statement instanceof t.IfStatement)
            ) {
              this.writer.write(';');
            }

            if (i !== arr.length - 1) {
              this.writer.write('\n');
            }
          });
        });
        this.writer.write('}');
      },
      ComponentProp: (node) => {
        this.writer.write(node.name);

        if (node.init) {
          this.writer.write(`=`);
          this.stringify(node.init);
        }
      },
      CompositeComponent: (node) => {
        this.writer.write(`component ${node.name}(`);

        const props = node.props.flatMap((prop, i, arr) => {
          return this.writer.withTemp(() => this.stringify(prop));
        });

        if (props.length > 3) {
          this.writer.withIndent(() => {
            props.forEach((prop, i, arr) => {
              this.writer.write(prop);
              if (i !== arr.length - 1) {
                this.writer.write(',');
                this.writer.write('\n');
              }
            });
          });
        } else {
          props.forEach((prop, i, arr) => {
            this.writer.write(prop);
            if (i !== arr.length - 1) {
              this.writer.write(',');
            }
          });
        }

        this.writer.write(')');
        if (node.state.length > 0) {
          this.writer.write(' {');
          this.writer.withIndent(() => {
            node.state.forEach((state, i, arr) => {
              this.stringify(state);
              this.writer.write(';');
              if (i !== arr.length - 1) {
                this.writer.write('\n');
              }
            });
          });
          this.writer.write('}');
        }

        this.writer.write(' => ');

        this.writer.write('(');
        this.writer.withIndent(() => {
          this.stringify(node.template);
        });
        this.writer.write(')');
      },
      Template: (node) => {
        const tag =
          node instanceof t.ComponentTemplate
            ? node.component.name
            : node instanceof t.TagTemplate
            ? node.tag
            : node instanceof t.SlotTemplate
            ? 'slot'
            : undefined;

        invariant(tag, `Tag is undefined`);

        const result = [`<${tag}`];

        this.writer.write(`<${tag}`);

        const propKeys = Object.keys(node.props);

        const props: WriterResult[] = [];
        const eachDirective = node.each;
        const ifDirective = node.if;
        const classlistDirective = node.classList;

        if (propKeys.length > 0) {
          props.push(
            this.writer.withTemp(() => {
              propKeys.forEach((prop, i, arr) => {
                this.writer.write(`${prop}={`);
                this.stringify(node.props[prop]);
                this.writer.write('}');
                if (i !== arr.length - 1) {
                  this.writer.write('\n');
                }
              });
            })
          );
        }

        if (eachDirective) {
          props.push(
            this.writer.withTemp(() => {
              this.writer.write(`@each={${eachDirective.alias.name} in `);
              if (!eachDirective.index) {
                this.writer.write(eachDirective.iterator.name);
              } else {
                this.writer.write(
                  `(${eachDirective.iterator.name}, ${eachDirective.index.name})`
                );
              }
              this.writer.write(`}`);
            })
          );
        }

        if (ifDirective) {
          props.push(
            this.writer.withTemp(() => {
              this.writer.write(`@if={`);
              this.stringify(ifDirective);
              this.writer.write('}');
            })
          );
        }

        if (classlistDirective) {
          props.push(
            this.writer.withTemp(() => {
              this.writer.write('@classList={');
              this.stringify(classlistDirective);
              this.writer.write('}');
            })
          );
        }

        const flattenedProps = props.reduce(
          (accum, prop, i, arr) => [
            ...accum,
            ...prop,
            ...(i !== arr.length - 1 ? ['\n'] : []),
          ],
          []
        );

        if (flattenedProps.length > 0) {
          if (flattenedProps.length > 2) {
            this.writer.withIndent(() => {
              this.writer.write(flattenedProps);
            });
          } else {
            this.writer.write(' ');
            this.writer.write(flattenedProps);
          }
        }

        if (node.children.length > 0) {
          this.writer.write('>');
          result.push('>');
        } else {
          this.writer.write(['/>']);
        }

        this.writer.withIndent(() => {
          node.children.forEach((child, i, arr) => {
            this.stringify(child);
            if (i !== arr.length - 1) {
              this.writer.write('\n');
            }
          });
        });

        if (node.children.length > 0) {
          this.writer.write(`</${tag}>`);
        }
      },
      Program: (node) => {
        node.globals.forEach((global) => {
          this.stringify(global);
          this.writer.write(';');
          this.writer.write('\n');
        });

        if (node.globals.length > 0) {
          this.writer.write('\n');
        }

        node.components.forEach((component, i, arr) => {
          this.stringify(component);
          if (i !== arr.length - 1) {
            this.writer.write('\n');
          }
        });
      },
    });
  }
}

export class Stringifier {
  static toString(node: t.ASTNode) {
    const _stringifer = new _Stringifier();
    return _stringifer.toString(node);
  }
}
