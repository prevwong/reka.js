import { Reka } from '@rekajs/core';
import * as t from '@rekajs/types';

const run = async () => {
  const reka = Reka.create();

  reka.load(
    t.state({
      program: t.program({
        globals: [],
        components: [
          t.rekaComponent({
            name: 'App',
            props: [],
            state: [],
            template: t.tagTemplate({
              tag: 'div',
              props: {},
              children: [
                t.tagTemplate({
                  tag: 'text',
                  props: {
                    value: t.literal({
                      value: 'Hello World!',
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

  const frame = await reka.createFrame({
    id: 'my-app-component',
    component: {
      name: 'App',
      props: {},
    },
  });

  const view = frame.view;

  console.log('view', view);

  const appComponent = reka.program.components[0];

  reka.change(() => {
    appComponent.template.children.push(
      t.tagTemplate({
        tag: 'button',
        props: {},
        children: [
          t.tagTemplate({
            tag: 'text',
            props: {
              value: t.literal({ value: 'Click me!' }),
            },
            children: [],
          }),
        ],
      })
    );
  });

  console.log(appComponent.template.children[1]);

  reka.watch(() => {
    if (appComponent.template instanceof t.TagTemplate) {
      console.log('appComponent =>', appComponent.template.tag);
    }
  });

  reka.watch(() => {
    if (frame.view) {
      console.log(
        'frame root tag =>',
        t.assert(frame.view.render[0], t.TagView).tag
      );
    }
  });

  reka.change(() => {
    t.assert(appComponent.template, t.TagTemplate).tag = 'section';
  });
};

run();
