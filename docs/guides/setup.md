# Getting started 

## Installation

```
npm install @composite/types @composite/state
```

## Define a new State

First, we need a new `Composite` instance which requires a `State` data type - to contain a list of components and global variables created by the end-user.

For now, we will create an initial `State` type with a simple App component:

```tsx
import { Composite } from '@composite/state';
import * as t from '@composite/types';

const composite = new Composite();

composite.load(
    t.State({
        program: t.Program({
            components: [
                t.CompositeComponent({
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
                                        value: 'Hello World!'
                                    })
                                },
                                children: []
                            })
                        ]
                    })
                })
            ]
        })
    })
)
```

The above example is equivalent to the following the React component:

```tsx
const App = () => {
    return (
        <div>
            Hello World
        </div>
    )
}
```

## Create a Component Instance

Next, let's create a new `Frame` to evaluate an instance of our newly created App component from above:

```tsx
const composite = new Composite(...);

const frame = composite.createFrame({
    component: {
        name: 'App',
        props: {}
    }
});
```

The `Frame` instance computes a `View` which is essentially the resulting render output of a component's instance. 

We can retrieve the computed `View` by accessing `root` property of a `Frame`:

```tsx
const view = frame.root;

// view =
{
    type: "CompositeComponentView",
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

Now that we have a working `Composite` instance with a valid `State`, let's try to make some changes to it. 

Changes made to the `State` must be wrapped with the `.change()` method.

For example, let's add a new `<button>` element:

```tsx
const appComponent = composite.state.components[0];

composite.change(() => {
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

We created a `Frame` instance from before, but what happens to its `View` when we performed the above mutation? 

Well, its `View` is automatically updated to reflect the changes made in the `State`: 

```tsx
// from previous example
const frame = composite.createFrame(...)

composite.change(() => {...});

console.log(appComponent.template.children[1]);

console.log(frame.root);
// console:
{
    type: "CompositeComponentView",
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

Often times, it would be pretty useful to know when there's a change made to either a part of the `State` :

```tsx
import * as t from '@composite/types';

const composite = new Composite(...);
const frame = composite.createFrame(...);

const appComponent = composite.state.components[0];

composite.subscribe(() => {
    if ( appComponent.template instanceof t.TagView ) {
        console.log('appComponent =>', appComponent.template.tag);
    }
});

composite.change(() => {
    appComponent.template.tag = 'section';
})
// 1) console: appComponent => section

composite.change(() => {
    appComponent.template.tag = 'div';
})
// 2) console: appComponent => div
```

The same can be done in order watch for changes made to a resulting View:

```tsx
import * as t from '@composite/types';

const composite = new Composite(...);
const frame = composite.createFrame(...);

const appComponent = composite.state.components[0];

composite.subscribe(() => {
    console.log('frame root tag =>', frame.root.tag);
})

composite.change(() => {
    appComponent.template.tag = 'section';
})
// 1) console: frame root tag => section

composite.change(() => {
    appComponent.template.tag = 'div';
})
// 2) console: frame root tag => div
```