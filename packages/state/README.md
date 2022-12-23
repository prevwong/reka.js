# Composite

Composite is a state management system for building no-code page editors.

## Why?

A large part of the complexity of building no-code page editors comes from the architecting of the state management system to power such editors (ie: how should the end user designs be stored and how can preview their designs on our editors?)

Composite solves this by providing an AST-powered state system to enable end-users to create UI components that are nearly as complex as ones developers could write in code; along with an interpreter to efficiently compute an output that could be rendered on the browser.

It's primarily built to eventually serve as the new state management system to power Craft.js and its page builders.

## Features

### AST-based State :zap:

Composite's State is an AST which enables end-users to build complex UI components with features that developers are familiar with from UI frameworks such as React:

```tsx
[
    {
        type: "CompositeComponent",
        name: "Counter",
        props: []
        state: [
            { type: "Val", name: "counter", init: { type: "Literal", value: 0 } },
        ],
        template: {
            type: "TagTemplate",
            tag: 'p',
            props: {},
            children: [
                { type: "TagTemplate", tag: 'text', props: { value: { type: "Literal", value: "My counter: " } },            
                { type: "TagTemplate", tag: 'text', props: { value: { type: "Identifier", value: "counter" } } }}
            ]
        }
    },
    {
        type: "CompositeComponent",
        name: "App",
        state: [],
        template: {
            type: "TagTemplate",
            tag: 'div',
            props: {},
            children: [
                { type: "TagTemplate", component: "Counter", props: {} }
            ]
        }
    }
]

// which is the equivalent of the following React code:
const Counter = () => {
    const [counter, setCounter] = useState(0);

    return ( <p>My Counter: {counter}</p>)
}

const App = () => {
    return (
        <div>
            <Counter />
        </div>
    )
}
```

This essentially means that you could build page editors where your end-users are able to design entire UI components with stateful values and templating capabilities (ie: conditionally rendering elements, expressions as props, rendering elements from a list etc)

### Portable :car:

Composite computes a component instance from its State by outputing a simple JSON structure called the `View`: 

```tsx
// Compute a View for the Counter component
console.log(composite.createFrame('Counter').root);

// console:
{
    type: "CompositeComponentView",
    component: { type: "CompositeComponent", component: "Counter" },
    root: {
        type: "ElementTagView",
        tag: "p",
        props: {},
        children: [
            { type: "ElementTagView", tag: "text", props: { value: "My counter: " }},
            { type: "ElementTagView", tag: "text", props: { value: 0 }}
        ]
    }
}
```

Whenever there's a change made to the State (eg: adding a new child to a parent template), Composite efficiently recomputes the updated `View`.

The `View` is a simple serialisable JSON structure So regardless of what UI framework you're working with to build your page builder, whether it's React, Vue or Svelte - building a renderer for Composite simply means taking this JSOn structure and rendering it in your preferred UI framework.

### Extensible State :hammer:

Of course, page builders often times may require additional data to be stored as part of the `State`. For example, you want your end users to be able to leave a comment on a template element; you can store these comments directly as part of the `State`: 

```tsx
import { createExtension } from '@composite/state';

type CommentState = {
    comments: Array<{
        templateId: string; // Id of the Template element associated with the comment
        content: string;
    }>
}

const CommentExtension = createExtension<CommentState>({
    key: 'comments', 
    state: {
        // initial state
        comments: []
    },
    init: extension => {
        // do whatever your extension may have to do here
        // ie: send some data to the backend or listen to some changes made in State
    }
});

// Usage
composite.change(() => {
    composite.getExtension(CommentExtension).comments.push({
        templateId: '...',
        content: "This button tag should be larger!!" 
    })
})
```

### Realtime Collaboration :tada:

Oh, you need multiplayer in your page editor too? No problem, Composite provides an external package that allows realtime collaboration via a fully-featured CRDT backed by Yjs

```tsx
import { Composite } from '@composite/state';
import * as t from '@composite/types';
import { createCollabExtension } from '@composite/collaboration';

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

// 1. Create a new Yjs Doc
const doc = new Y.Doc();

// 2. Create a new Y.Map from the Doc
const type = doc.getMap('my-collaborative-editor');
// Note: The flattened State is actually stored in type.getMap('document');

const CollabExtension = createCollabExtension(type);

// 3. Create a new Composite instance with an initial State
const composite = new Composite({
    extensions: [CollabExtension]
}); 
// The initial State Document, this should come from the Yjs type
composite.load(t.unflatten(type.getMap('document')))

// 4. Bind connector
const provider = new WebrtcProvider(
    'collab-room',
    doc
);
```

