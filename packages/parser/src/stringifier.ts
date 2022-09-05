import * as t from '@composite/types';
import invariant from 'tiny-invariant';

export class Stringifier {
  stringify(node: t.Any) {
    return t.switchTypes(node, {
      Literal: (node) => {
        if (typeof node.value === 'string') {
          return `"${node.value}"`;
        }
        return node.value.toString();
      },
      BinaryExpression: (node) => {
        return `${this.stringify(node.left)}${node.operator}${this.stringify(
          node.right
        )}`;
      },
      Identifier: (node) => node.name,
      Val: (node) => {
        return `val ${node.name} = ${this.stringify(node.init)};`;
      },
      MemberExpression: (node) => {
        return `${this.stringify(node.object)}.${node.property.name}`;
      },
      Func: (node) => {
        const params = node.params.join(',');

        return `(${params}) => {${node.body.statements
          .map((stmt) => this.stringify(stmt))
          .join(`;\n`)}}`;
      },
      Assignment: (node) => {
        return `${this.stringify(node.left)} ${node.operator} ${this.stringify(
          node.right
        )}`;
      },
      Template: (node) => {
        // TODO: handle components differently
        const tag =
          node instanceof t.ComponentTemplate
            ? node.component.name
            : node instanceof t.TagTemplate
            ? node.tag
            : node instanceof t.SlotTemplate
            ? 'slot'
            : undefined;

        invariant(tag, `Tag is undefined`);
        const props = Object.keys(node.props).reduce((accum, key) => {
          const value = node.props[key];

          return `${accum} ${key}=${
            typeof value === 'string'
              ? `"${value}"`
              : `{${this.stringify(value)}}`
          }`;
        }, ``);

        let directives = ``;

        if (node.each) {
          let start;

          if (node.each.index) {
            start = `(${node.each.alias.name}, ${node.each.index.name})`;
          } else {
            start = node.each.alias.name;
          }

          directives += ` @each={${start} in ${node.each.iterator.name}}`;
        }

        if (node.if) {
          directives += ` @if={${this.stringify(node.if)}}`;
        }

        const children = node.children
          .map((child) => this.stringify(child))
          .flat();

        if (children.length > 0) {
          return [`<${tag}${props}${directives}>`, children, `</${tag}>`];
        }

        return `<${tag}${props}${directives} />`;
      },
      ComponentProp: (node) => {
        return `${node.name}`;
      },
      CompositeComponent: (node) => {
        return [
          `component ${node.name}(${node.props.map((prop) =>
            this.stringify(prop)
          )}) {`,
          node.state.map((s) => this.stringify(s)),
          `} => (`,
          this.stringify(node.template),
          `)\n`,
        ];
      },
      Program: (node) => {
        return [
          node.globals.map((global) => this.stringify(global)),
          '',
          ...node.components.map((component) => this.stringify(component)),
        ];
      },
    });
  }

  toString(node: t.Any) {
    const arr = this.stringify(node);

    let depth = -1;
    let str = ``;

    const _toString = (arr: (string | string[])[]) => {
      depth += 1;

      for (let i = 0; i < arr.length; i++) {
        const c = arr[i];

        if (Array.isArray(c)) {
          _toString(c);
          continue;
        }

        if (str !== '') {
          str += '\n';
        }

        if (depth > 1) {
          for (let j = 0; j < depth; j++) {
            str += ' ';
          }
        }

        str += c;
      }

      depth -= 1;
    };
    _toString(arr);

    return str;
  }
}
