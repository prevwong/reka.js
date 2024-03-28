import * as t from '@rekajs/types';
import { invariant, safeObjKey } from '@rekajs/utils';

import { BinaryPrecedence, Precedence } from './precedence';
import { EXTERNAL_IDENTIFIER_PREFIX_SYMBOL } from './utils';
import { Writer, WriterResult } from './writer';

export type StringifierOpts = {
  onStringifyNode: (
    node: t.ASTNode,
    stringifier: _Stringifier
  ) => t.ASTNode | null | undefined;
};

class _Stringifier {
  writer: Writer = new Writer();
  opts: StringifierOpts;

  constructor(opts?: StringifierOpts) {
    this.opts = {
      onStringifyNode: () => {
        return null;
      },
      ...opts,
    };
  }

  private stringifyInput(input: t.Kind) {
    const _stringifyInputType = (input: t.Kind) => {
      if (t.is(input, t.ArrayKind)) {
        this.writer.write(`array<`);
        _stringifyInputType(input.elements);
        this.writer.write('>');

        return;
      }

      if (t.is(input, t.OptionKind)) {
        this.writer.write('option<');
        this.writer.write(JSON.stringify(input.options));
        this.writer.write('>');
        return;
      }

      if (t.is(input, t.StringKind)) {
        this.writer.write('string');
        return;
      }

      if (input instanceof t.NumberKind) {
        this.writer.write(`number`);
        if (input.min !== null || input.max !== null) {
          this.writer.write(`<`);
          this.writer.write(input.min !== null ? input.min.toString() : '_');

          if (input.max !== null) {
            this.writer.write(input.max.toString());
          }

          this.writer.write('>');
        }
        return;
      }

      if (t.is(input, t.BooleanKind)) {
        this.writer.write('boolean');
        return;
      }

      if (t.is(input, t.CustomKind)) {
        this.writer.write(input.name);
        return;
      }

      this.writer.write('any');
    };

    this.writer.write(`:`);
    _stringifyInputType(input);
  }

  toString(node: t.ASTNode) {
    this.stringify(node);

    return this.writer.toString();
  }

  parenthesize(
    result: WriterResult,
    currentPrecedence: Precedence,
    precedence: Precedence
  ) {
    if (currentPrecedence < precedence) {
      this.writer.write('(');
      this.writer.write(result);
      this.writer.write(')');
      return;
    }

    this.writer.write(result);
  }

  stringify(node: t.ASTNode, precedence: Precedence = Precedence.Sequence) {
    const value = this.opts.onStringifyNode(node, this);

    if (value) {
      node = value;
    }

    return t.match(node, {
      Literal: (node) => {
        if (typeof node.value === 'string') {
          this.writer.write(`"${node.value}"`);
          return;
        }

        this.writer.write(node.value.toString());
      },
      String: (node) => {
        this.writer.write('`');
        node.value.forEach((strOrExpr) => {
          if (typeof strOrExpr === 'string') {
            this.writer.write(strOrExpr);
            return;
          }

          this.writer.write('{{');
          this.stringify(strOrExpr, precedence);
          this.writer.write('}}');
        });
        this.writer.write('`');
      },
      ArrayExpression: (node) => {
        this.writer.write('[');
        node.elements.forEach((element, i) => {
          this.stringify(element);
          if (i !== node.elements.length - 1) {
            this.writer.write(',');
          }
        });
        this.writer.write(']');
      },
      BinaryExpression: (node) => {
        let result: WriterResult;

        const currentPrecedence = BinaryPrecedence[node.operator];

        const leftPrecedence = currentPrecedence;
        const rightPrecedence = currentPrecedence + 1;

        const leftFragment = this.writer.withTemp(() => {
          this.stringify(node.left, leftPrecedence);
        });

        const rightFragment = this.writer.withTemp(() =>
          this.stringify(node.right, rightPrecedence)
        );

        result = Writer.join(leftFragment, [node.operator]);
        result = Writer.join(result, rightFragment);

        this.parenthesize(result, currentPrecedence, precedence);
      },
      MemberExpression: (node) => {
        this.stringify(node.object);
        this.writer.write('[');
        this.stringify(node.property);
        this.writer.write(']');
      },
      ObjectExpression: (node) => {
        this.writer.write('{');
        this.writer.withIndent(() => {
          Object.keys(node.properties).forEach((property, i, arr) => {
            this.writer.write(`"${safeObjKey(property)}": `);
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
        const result = this.writer.withTemp(() => {
          this.stringify(node.condition, Precedence.Coalesce);
          this.writer.write(' ? ');
          this.stringify(node.consequent, Precedence.Assignment);
          this.writer.write(' : ');
          this.stringify(node.alternate, Precedence.Assignment);
        });

        this.parenthesize(result, Precedence.Conditional, precedence);
      },
      IfStatement: (node) => {
        this.writer.write(`if (`);
        this.stringify(node.condition);
        this.writer.write(') ');
        this.stringify(node.consequent);
      },
      Identifier: (node) => {
        this.writer.write(
          node.external
            ? `${EXTERNAL_IDENTIFIER_PREFIX_SYMBOL}${node.name}`
            : node.name
        );
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

        if (node.kind) {
          this.stringifyInput(node.kind);
        }

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
              this.writer.write('; ');
            }

            if (i !== arr.length - 1) {
              this.writer.write('\n');
            }
          });
        });
        this.writer.write('}');
      },
      Param: (node) => {
        this.writer.write(node.name);
      },
      Variable: (node) => {
        this.writer.write(node.name);

        if (node.kind) {
          this.stringifyInput(node.kind);
        }

        if (node.init) {
          this.writer.write(`=`);
          this.stringify(node.init);
        }
      },
      ComponentProp: (node) => {
        if (node.bindable) {
          this.writer.write(`@`);
        }

        this.writer.write(node.name);

        if (node.kind) {
          this.stringifyInput(node.kind);
        }

        if (node.init) {
          this.writer.write(`=`);
          this.stringify(node.init);
        }
      },
      RekaComponent: (node) => {
        this.writer.write(`component ${node.name}(`);

        const props = node.props.flatMap((prop) => {
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
      PropBinding: (node) => {
        this.stringify(node.identifier);
      },
      Template: (node) => {
        const tag =
          node instanceof t.ComponentTemplate
            ? this.writer.withTemp(() => this.stringify(node.component))
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
                const valueExpr = node.props[prop];
                this.writer.write(`${prop}`);
                if (t.is(valueExpr, t.PropBinding)) {
                  this.writer.write(':');
                }
                this.writer.write(`={`);
                this.stringify(valueExpr);
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
              this.writer.write(`@each={`);

              if (eachDirective.index) {
                this.writer.write(
                  `(${eachDirective.alias.name}, ${eachDirective.index.name})`
                );
              } else {
                this.writer.write(eachDirective.alias.name);
              }

              this.writer.write(` in `);

              const iteratorStr = this.writer.withTemp(() =>
                this.stringify(eachDirective.iterator)
              );

              this.writer.write(iteratorStr);

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

        if (t.is(node, t.SlottableTemplate) && node.children.length > 0) {
          this.writer.write('>');
          result.push('>');
        } else {
          if (flattenedProps.length <= 2) {
            this.writer.write(' ');
          }

          this.writer.write(['/>']);
        }

        if (t.is(node, t.SlottableTemplate)) {
          this.writer.withIndent(() => {
            node.children.forEach((child, i, arr) => {
              this.stringify(child);
              if (i !== arr.length - 1) {
                this.writer.write('\n');
              }
            });
          });
        }

        if (t.is(node, t.SlottableTemplate) && node.children.length > 0) {
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
            this.writer.write('\n\n');
          }
        });
      },
    });
  }
}

export class Stringifier {
  static toString(node: t.ASTNode, opts?: StringifierOpts) {
    const _stringifer = new _Stringifier(opts);
    return _stringifer.toString(node);
  }
}
