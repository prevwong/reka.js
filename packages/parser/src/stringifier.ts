import * as t from '@rekajs/types';
import { invariant, safeObjKey } from '@rekajs/utils';

import { BinaryPrecedence, Precedence } from './precedence';
import { Writer, WriterResult } from './writer';

class _Stringifier {
  writer: Writer = new Writer();

  toString(node: t.ASTNode) {
    this.stringify(node);

    return this.writer.toString();
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

        result = Writer.join(leftFragment, [node.operator]);
        result = Writer.join(result, rightFragment);

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
      ExternalGlobal: (node) => {
        this.writer.write(`$${node.name}`);
        this.writer.write('(');
        const paramsKeys = Object.keys(node.params);

        if (paramsKeys.length > 0) {
          this.writer.write('{ ');
          paramsKeys.forEach((key, i, arr) => {
            this.writer.write(`${key}: `);
            this.stringify(node.params[key]);
            if (i !== arr.length - 1) {
              this.writer.write(', ');
            }
          });
          this.writer.write(' }');
        }

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
              this.writer.write('; ');
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
              this.writer.write(`@each={`);

              if (eachDirective.index) {
                this.writer.write(
                  `(${eachDirective.alias.name}, ${eachDirective.index.name})`
                );
              } else {
                this.writer.write(eachDirective.alias.name);
              }

              this.writer.write(` in ${eachDirective.iterator.name}`);

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
          if (flattenedProps.length <= 2) {
            this.writer.write(' ');
          }

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
            this.writer.write('\n\n');
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
