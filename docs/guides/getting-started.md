# Getting started

## Installation

Before we start, we need to install 2 packages:

- `@rekajs/types` which provides APIs to create Reka data types (ie: the `State` AST nodes)
- `@rekajs/core` which allows us to create a new `Reka` instance

```
npm install @rekajs/types @rekajs/core
```

## Define a new State

First, we need a new `Reka` instance which requires a `State` data type that will be used to store the components and global variables created by the end user.

For now, we will create an initial `State` type with a simple App component:

```tsx
import { Reka } from '@rekajs/core';
import * as t from '@rekajs/types';

const reka = Reka.create();

reka.load(
  t.state({
    program: t.program({
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
```

The above component in the State is equivalent to the following React component:

```tsx
const App = () => {
  return <div>Hello World</div>;
};
```

## Creating a Frame

Next, let's create a new `Frame` to evaluate an instance of our newly created App component from above:

```tsx
const reka = Reka.create(...);

const frame = await reka.createFrame({
    id: 'my-app-component',
    component: {
        name: 'App',
        props: {}
    }
});
```

The `Frame` instance computes a `View` which is the resulting render output of a component's instance:

```tsx
const view = frame.view;

// view =
{
    type: "RekaComponentView",
    component: '...',
    root: {
        type: 'TagView',
        tag: 'div',
        props: {},
         children: [
            {
                type: 'TagView',
                tag: 'text',
                props: {
                    value: 'Hello World!',
                },
                children: []

            }
        ]
    }
}
```

## Mutating the State

Now that we have a working `Reka` instance with a valid `State`, let's try to make some changes to it.

Changes made to the `State` must be wrapped with the `.change()` method.

For example, let's add a new `<button>` element to our App component:

```tsx
const appComponent = reka.state.components[0];

reka.change(() => {
    appComponent.template.children.push(t.tagTemplate({
        tag: 'button',
        props: {},
        children: [
            t.tagTemplate({
                tag: 'text',
                props: {
                    value: 'Click me!',
                },
                children: []
            })
        ]
    }));
});

console.log(appComponent.template.children[1]);

// console:
{ type: "TagTemplate", tag: "button", props: {}, children: [...] }
```

### Views are automatically updated

Earlier, we created a `Frame` instance, but what happens to its `View` when we performed the above mutation?

Well, its `View` is automatically updated to reflect the changes made in `State`:

```tsx
// from previous example
const frame = await reka.createFrame(...)

reka.change(() => {...});

console.log(appComponent.template.children[1]);

console.log(frame.view);
// console:
{
    type: "RekaComponentView",
    component: '...',
    root: {
        type: 'TagView',
        tag: 'div',
        props: {},
        children: [
            {
                type: 'TagView',
                tag: 'text',
                props: {
                    value: 'Hello World!',
                },
                children: []
            },
            // View has been updated to contain the following child View
            // as a result of the mutation to add a new <button> TagTemplate in the State
            {
                type: 'TagView',
                tag: 'button',
                props: {},
                children: [
                    {
                        type: 'TagView',
                        tag: 'text',
                        props: { value: 'Click me!' },
                        children: []
                    }
                ]
            }
        ]
    }
}
```

## Subscribing to changes

Oftentimes, it would be pretty useful to know when there's a change to a Reka data structure (ie: the `State` or `View`):

```tsx
reka.watch(() => {
  if (appComponent.template instanceof t.TagView) {
    console.log('appComponent =>', appComponent.template.tag);
  }
});

reka.subscribe(
  () => {
    return {
      tag: appComponent.template.tag,
    };
  },
  (collected) => {
    console.log('tag: ', collected.tag);
  }
);

reka.change(() => {
  appComponent.template.tag = 'section';
});
// 1)
// console:
// appComponent => section
// tag: section

reka.change(() => {
  appComponent.template.tag = 'div';
});
// 2)
// console:
// appComponent => div
// tag: div
```

The same can be done in order to watch for changes made to a resulting `View`:

```tsx
reka.watch(() => {
  console.log('frame root tag =>', frame.view.tag);
});

reka.change(() => {
  appComponent.template.tag = 'section';
});
// 1)
// console:
// frame root tag => section

reka.change(() => {
  appComponent.template.tag = 'div';
});
// 2)
// console:
// frame root tag => div
```
