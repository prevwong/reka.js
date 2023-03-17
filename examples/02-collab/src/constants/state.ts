import * as t from '@rekajs/types';

export const INITIAL_STATE = t.state({
  extensions: {},
  program: t.program({
    globals: [
      t.val({
        name: 'globalText',
        init: t.literal({ value: 'Global Text!' }),
      }),
    ],
    components: [
      t.rekaComponent({
        name: 'App',
        props: [],
        state: [],
        template: t.tagTemplate({
          tag: 'div',
          props: {
            className: t.literal({
              value: 'bg-neutral-100 px-3 py-4 w-full h-full',
            }),
          },
          children: [
            t.tagTemplate({
              tag: 'h4',
              props: {
                className: t.literal({ value: 'text-lg w-full' }),
              },
              children: [
                t.tagTemplate({
                  tag: 'text',
                  props: {
                    value: t.literal({ value: 'Hello World' }),
                  },
                  children: [],
                }),
              ],
            }),

            t.componentTemplate({
              component: t.identifier({ name: 'Button' }),
              props: {},
              children: [],
            }),
          ],
        }),
      }),
      t.rekaComponent({
        name: 'Button',
        props: [
          t.componentProp({
            name: 'text',
            init: t.literal({ value: 'Click me!' }),
          }),
        ],
        state: [t.val({ name: 'counter', init: t.literal({ value: 0 }) })],
        template: t.tagTemplate({
          tag: 'button',
          props: {
            className: t.literal({ value: 'rounded border-2 px-3 py-2' }),
            onClick: t.func({
              params: [],
              body: t.block({
                statements: [
                  t.assignment({
                    left: t.identifier({ name: 'counter' }),
                    operator: '+=',
                    right: t.literal({ value: 1 }),
                  }),
                ],
              }),
            }),
          },
          children: [
            t.tagTemplate({
              tag: 'text',
              props: {
                value: t.identifier({ name: 'text' }),
              },
              children: [],
            }),
            t.tagTemplate({
              tag: 'text',
              props: {
                value: t.binaryExpression({
                  left: t.literal({ value: ' -> ' }),
                  operator: '+',
                  right: t.identifier({ name: 'counter' }),
                }),
              },
              children: [],
            }),
          ],
        }),
      }),
    ],
  }),
});
