import * as t from '@rekajs/types';

import { Stringifier } from '../stringifier';
import { Writer } from '../writer';

describe('Stringifier', () => {
  it('should be able to stringify expressions', () => {
    expect(Stringifier.toString(t.literal({ value: 10 }))).toEqual('10');
    expect(Stringifier.toString(t.literal({ value: 'string' }))).toEqual(
      '"string"'
    );
    expect(
      Stringifier.toString(
        t.binaryExpression({
          left: t.literal({ value: 10 }),
          operator: '+',
          right: t.binaryExpression({
            left: t.identifier({
              name: 'counter',
            }),
            operator: '+',
            right: t.literal({
              value: 1,
            }),
          }),
        })
      )
    ).toEqual('10 + (counter + 1)');
  });
  describe('Template', () => {
    it('should be able to parse various template types', () => {
      expect(
        Stringifier.toString(
          t.tagTemplate({
            tag: 'div',
            props: { color: t.literal({ value: 'red' }) },
            children: [],
          })
        )
      ).toEqual('<div color={"red"} />');

      expect(
        Stringifier.toString(
          t.componentTemplate({
            component: t.identifier({ name: 'Button' }),
            props: { color: t.literal({ value: 'red' }) },
            children: [],
          })
        )
      ).toEqual('<Button color={"red"} />');

      expect(Stringifier.toString(t.slotTemplate({ props: {} }))).toEqual(
        '<slot />'
      );
    });
    it('should parse directives', () => {
      expect(
        Stringifier.toString(
          t.tagTemplate({
            tag: 'div',
            props: {},
            children: [],
            if: t.binaryExpression({
              left: t.identifier({ name: 'counter' }),
              operator: '>',
              right: t.literal({ value: 0 }),
            }),
          })
        )
      ).toEqual(`<div @if={counter > 0} />`);

      expect(
        Stringifier.toString(
          t.tagTemplate({
            tag: 'div',
            props: {},
            children: [],
            each: t.elementEach({
              iterator: t.identifier({ name: 'posts' }),
              alias: t.elementEachAlias({ name: 'post' }),
              index: t.elementEachIndex({ name: 'i' }),
            }),
          })
        )
      ).toEqual(`<div @each={(post, i) in posts} />`);

      expect(
        Stringifier.toString(
          t.tagTemplate({
            tag: 'div',
            props: {},
            children: [],
            each: t.elementEach({
              iterator: t.identifier({ name: 'posts' }),
              alias: t.elementEachAlias({ name: 'post' }),
            }),
          })
        )
      ).toEqual(`<div @each={post in posts} />`);

      expect(
        Stringifier.toString(
          t.tagTemplate({
            tag: 'div',
            props: {},
            children: [],
            classList: t.objectExpression({
              properties: {
                ['bg-blue-900']: t.literal({ value: true }),
              },
            }),
          })
        )
      ).toEqual(
        Writer.block((writer) => {
          writer.write(`<div`);
          writer.withIndent(() => {
            writer.write(`@classList={{`);
            writer.withIndent(() => {
              writer.write('"bg-blue-900": true');
            });
            writer.write(`}}`);
          });
          writer.write('/>');
        })
      );
    });
  });
  it('should be able to parse component', () => {
    expect(
      Stringifier.toString(
        t.rekaComponent({
          name: 'App',
          state: [t.val({ name: 'counter', init: t.literal({ value: 0 }) })],
          props: [t.componentProp({ name: 'color', kind: t.anyKind() })],
          template: t.tagTemplate({
            tag: 'div',
            props: {},
            children: [],
          }),
        })
      )
    ).toEqual(
      Writer.block((writer) => {
        writer.write('component App(color:any) {');
        writer.withIndent(() => {
          writer.write('val counter:any = 0;');
        });
        writer.write('} => (');
        writer.withIndent(() => {
          writer.write('<div />');
        });
        writer.write(')');
      })
    );
  });
  it('should be able to stringify vals with input types', () => {
    expect(
      Stringifier.toString(
        t.val({
          name: 'color',
          kind: t.customKind({ name: 'Color' }),
          init: t.literal({ value: 'blue' }),
        })
      )
    ).toEqual(`val color:Color = "blue"`);

    expect(
      Stringifier.toString(
        t.val({
          name: 'colors',
          kind: t.arrayKind({
            elements: t.stringKind(),
          }),
          init: t.arrayExpression({ elements: [t.literal({ value: 'blue' })] }),
        })
      )
    ).toEqual(`val colors:array<string> = ["blue"]`);

    expect(
      Stringifier.toString(
        t.val({
          name: 'colors',
          kind: t.optionKind({
            options: {
              blue: 'Blue',
              red: 'Red',
              green: 'Green',
            },
          }),
          init: t.literal({ value: 'blue' }),
        })
      )
    ).toEqual(
      `val colors:option<{"blue":"Blue","red":"Red","green":"Green"}> = "blue"`
    );
  });
  it('should preserve precedence when parsing conditional expressions within binary expressions', () => {
    expect(
      Stringifier.toString(
        t.binaryExpression({
          left: t.identifier({ name: 'left' }),
          operator: '+',
          right: t.conditionalExpression({
            condition: t.identifier({ name: 'isRequired' }),
            consequent: t.literal({ value: '*' }),
            alternate: t.literal({ value: '' }),
          }),
        })
      )
    ).toEqual(`left + (isRequired ? "*" : "")`);
  });
  it('should be able to stringify nested objects correctly', () => {
    expect(
      Stringifier.toString(
        t.assignment({
          left: t.identifier({ name: 'obj' }),
          operator: '=',
          right: t.objectExpression({
            properties: {
              foo: t.literal({ value: 1 }),
              bar: t.literal({ value: 0 }),
            },
          }),
        })
      )
    ).toEqual(`obj = {\n "foo": 1,\n "bar": 0\n}`);
  });
  it('should be able to stringifiy prop binding', () => {
    expect(
      Stringifier.toString(
        t.tagTemplate({
          tag: 'input',
          props: {
            value: t.propBinding({
              identifier: t.identifier({
                name: 'value',
              }),
            }),
          },
        })
      )
    ).toEqual(`<input value:={value} />`);
  });
  it('should be able to stringifiy string type', () => {
    expect(
      Stringifier.toString(
        t.string({
          value: [
            'Hello ',
            t.identifier({
              name: 'myVariable',
            }),
            ' + ',
            t.binaryExpression({
              left: t.literal({ value: 1 }),
              operator: '+',
              right: t.literal({ value: 1 }),
            }),
          ],
        })
      )
    ).toEqual('`Hello {{myVariable}} + {{1 + 1}}`');
  });
});
