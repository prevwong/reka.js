import { Reka } from '@rekajs/core';
import { RekaProvider } from '@rekajs/react';
import * as t from '@rekajs/types';
import Script from 'next/script';
import * as React from 'react';

import { Editor } from '@/components/Editor';
import { Preview } from '@/components/Preview';

const reka = Reka.create();

reka.load(
  t.state({
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
  })
);

reka.createFrame({
  id: 'Main app',
  component: {
    name: 'App',
  },
});

reka.createFrame({
  id: 'Primary button',
  component: {
    name: 'Button',
    props: {
      text: t.literal({ value: 'Primary button' }),
    },
  },
});

export default function Home() {
  return (
    <RekaProvider state={reka}>
      {/* Use Tailwind CDN so that tailwind classes used within our Reka component gets injected on-demand */}
      <Script src="https://cdn.tailwindcss.com"></Script>
      <div className="flex h-screen">
        <div className="w-3/6 h-full border-r-2">
          <Editor />
        </div>
        <div className="flex-1">
          <Preview />
        </div>
      </div>
    </RekaProvider>
  );
}
