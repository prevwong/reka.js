# reka.js

Reka is a state management system for building no-code editors.

![banner-min](https://user-images.githubusercontent.com/16416929/227709589-ab15ae78-d8eb-4ce8-b4e6-8ebbb3cff73b.png)

## Why?

Much of the complexity surrounding building no-code editors comes from architecting the state management system to power such editors (ie: how should the end user designs be stored and edited in a page editor?)

Reka solves this by providing an AST-powered state system that enables end-users to create UI components that are nearly as complex as ones that developers could write in code; along with an interpreter to efficiently compute an output that could be rendered on the browser.

It's primarily built to serve as the new state management system to power [Craft.js](https://craft.js.org) and its page builders.

## Features

### AST-based State :zap:

At the core of Reka is the State data structure which is an Abstract Syntax Tree (AST). This enables end-users to build complex UI components with features that developers are familiar with from UI frameworks such as React:

```tsx
[
  {
    type: 'RekaComponent',
    name: 'Counter',
    props: [
      {
        type: 'ComponentProp',
        name: 'initalValue',
        init: { type: 'Literal', value: 0 },
      },
    ],
    state: [
      {
        type: 'Val',
        name: 'counter',
        init: { type: 'Identifier', name: 'initialValue' },
      },
    ],
    template: {
      type: 'TagTemplate',
      tag: 'p',
      props: {},
      children: [
        {
          type: 'TagTemplate',
          tag: 'text',
          props: { value: { type: 'Literal', value: 'My counter: ' } },
        },
        {
          type: 'TagTemplate',
          tag: 'text',
          props: { value: { type: 'Identifier', value: 'counter' } },
        },
      ],
    },
  },
  {
    type: 'RekaComponent',
    name: 'App',
    state: [],
    template: {
      type: 'TagTemplate',
      tag: 'div',
      props: {},
      children: [{ type: 'TagTemplate', component: 'Counter', props: {} }],
    },
  },
];

// which is the equivalent of the following React code:
const Counter = ({ initialValue = 0 }) => {
  const [counter, setCounter] = useState(initialValue);

  return <p>My Counter: {counter}</p>;
};

const App = () => {
  return (
    <div>
      <Counter initalValue={10} />
    </div>
  );
};
```

This means you could build page editors where your end-users are able to design entire UI components with stateful values and templating capabilities (ie: conditionally rendering elements, expressions as props, rendering elements from a list etc)

### Portable :car:

Reka computes a Component instance from its State by generating a `View` tree:

```tsx
// Compute a View for the Counter component
const frame = await reka.createFrame({
  id: 'my-basic-counter-instance',
  component: {
    name: 'Counter',
    props: { initialValue: t.literal({ value: 10 }) }
  }
});

console.log(frame.view);
// console:
{
    type: "RekaComponentView",
    component: { type: "RekaComponent", component: "Counter" },
    root: {
        type: "TagView",
        tag: "p",
        props: {},
        children: [
            { type: "TagView", tag: "text", props: { value: "My counter: " }},
            { type: "TagView", tag: "text", props: { value: 10 }}
        ]
    }
}
```

Whenever there's a change made to the State (eg: adding a new child to a parent template), Reka efficiently recomputes the updated `View`.

The `View` tree is a simple serializable JSON structure. So regardless of what UI framework you're working with to build your page builder --- whether it's React, Vue or Svelte; building a renderer for Reka simply means taking this JSON structure and rendering it in your preferred UI framework.

### Extensible State :hammer:

Of course, page builders oftentimes may require additional data to be stored as part of the `State`. For example, let's say you want your end-users to be able to leave a comment on a template element; you can store these comments directly as part of the `State`:

```tsx
import { createExtension } from '@rekajs/core';

type CommentState = {
  comments: Array<{
    templateId: string; // Id of the Template element associated with the comment
    content: string;
  }>;
};

const CommentExtension = createExtension<CommentState>({
  key: 'comments',
  state: {
    // initial state
    comments: [],
  },
  init: (extension) => {
    // do whatever your extension may have to do here
    // ie: send some data to the backend or listen to some changes made in State
  },
});

// Usage
reka.change(() => {
  reka.getExtension(CommentExtension).state.comments.push({
    templateId: '...',
    content: 'This button tag should be larger!!',
  });
});
```

### External Functionalities :fire:

You may also want to expose additional functionalities for the end-users of your page builder to use. For example, let's say you want your end-users to have the ability to output the current date time:

```tsx
// 1) Expose function to return current time
const reka = Reka.create({
  externals: {
    functions: (self) => ({
      getDateTime: () => {
        return Date.now();
      },
    }),
  },
});

// 2) Global is now accessible throughout the State:
reka.load(
  t.state({
    program: t.program({
      components: [
        t.rekaComponent({
          name: 'App',
          states: [],
          props: [],
          template: t.tagTemplate({
            tag: 'text',
            props: {
              value: t.binaryExpression({
                left: t.literal({ value: 'Current date time is: ' }),
                operator: '+',
                right: t.callExpression({
                  identifier: {
                    name: 'getDateTime', // <-- access exposed function to return current time
                    external: true,
                  },
                  params: {},
                }),
              }),
            },
          }),
        }),
      ],
    }),
  })
);
```

### Realtime Collaboration :tada:

Oh, you need multiplayer in your page editor too? No problem, Reka provides an external package that allows real-time collaboration via a fully-featured CRDT backed by [Yjs](https://github.com/yjs/yjs)

```tsx
import { Reka } from '@rekajs/core';
import * as t from '@rekajs/types';
import { createCollabExtension } from '@rekajs/collaboration';

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

const doc = new Y.Doc();
const type = doc.getMap('my-collaborative-editor');

const reka = Reka.create({
  extensions: [createCollabExtension(type)],
});

reka.load(t.unflatten(type.getMap('document')));

new WebrtcProvider('collab-room', doc);
```

## Acknowledgments :raised_hands:

Reka is inspired by [Plasmic](https://www.plasmic.app/), [Builder.io](https://builder.io) and [Mitosis](https://github.com/BuilderIO/mitosis)
