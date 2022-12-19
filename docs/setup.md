# Basic Setup

## Installation

```
npm install @composite/types @composite/state
```

## Define a new Component

The first step is to create a new `Composite` instance. The `Composite` class requires a `State`, which specifies the list of end-user components and extension data; this should typically be supplied from a database. 

```tsx
import { Composite } from '@composite/state';
import * as t from '@composite/types';

const composite = new Composite({
    state: t.State({
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
})
```

In the above example, we've created a `State` that is equivalent to the following the React component:

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

The `Frame` instance computes a `View` which is essentially the resulting render output of the Component's instance. You can retrieve the computed `View` by accessing `frame.root`:

```tsx
const view = frame.root;

// View:
{
    type: "CompositeComponentView",
    component: '...',
    root: {
        type: 'ElementTagView',
        tag: 'div',
        props: {},
        children: [
            type: 'ElementTagView',
            tag: 'text',
            props: {
                value: 'Hello World!',
            },
            children: []
        ]
    }
}
```


