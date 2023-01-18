import { CompositeProvider } from '@composite/react';
import { Composite } from '@composite/state';
import * as t from '@composite/types';
import * as React from 'react';

import { Editor } from '@/components/Editor';
import { Preview } from '@/components/Preview';

export default function Home() {
  const [composite, setComposite] = React.useState<Composite | null>(null);

  React.useEffect(() => {
    const composite = new Composite();

    composite.load(
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
            t.compositeComponent({
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
            t.compositeComponent({
              name: 'Button',
              props: [
                t.componentProp({
                  name: 'text',
                  init: t.literal({ value: 'Click me!' }),
                }),
              ],
              state: [
                t.val({ name: 'counter', init: t.literal({ value: 0 }) }),
              ],
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
                      value: t.binaryExpression({
                        left: t.identifier({ name: 'text' }),
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

    setComposite(composite);
  }, []);

  if (!composite) {
    return null;
  }

  return (
    <CompositeProvider state={composite}>
      <div className="flex h-screen">
        <div className="w-3/6 h-full border-r-2">
          <Editor />
        </div>
        <div className="flex-1">
          <Preview />
        </div>
      </div>
    </CompositeProvider>
  );
}
