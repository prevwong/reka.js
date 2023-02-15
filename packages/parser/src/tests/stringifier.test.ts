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

      expect(
        Stringifier.toString(t.slotTemplate({ props: {}, children: [] }))
      ).toEqual('<slot />');
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
              alias: t.identifier({ name: 'post' }),
              index: t.identifier({ name: 'i' }),
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
              alias: t.identifier({ name: 'post' }),
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
          props: [t.componentProp({ name: 'color' })],
          template: t.tagTemplate({
            tag: 'div',
            props: {},
            children: [],
          }),
        })
      )
    ).toEqual(
      Writer.block((writer) => {
        writer.write('component App(color) {');
        writer.withIndent(() => {
          writer.write('val counter = 0;');
        });
        writer.write('} => (');
        writer.withIndent(() => {
          writer.write('<div />');
        });
        writer.write(')');
      })
    );
  });
});
