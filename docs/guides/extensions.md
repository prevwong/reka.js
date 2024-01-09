# Extensions

Apart from storing the `Program` AST, the `State` could optionally store additional values that your page builder may require.

For example, let's say you want to build a page builder where your end-users are able to leave a comment on a `Template` node of a `RekaComponent`, similar to what you could do on apps like Figma.

One way to go about this is to store these comments directly as part of the `State`, through an Extension.

> Apart from being able to interact with these additional values with the same APIs as the rest of Reka, another benefit of storing additional values via an Extension's state is in realtime collaboration via the `@rekajs/collaboration` package; where the Extension's state is automatically synced across peers.

## Creating an Extension

The anatomy of an `Extension` is as follows:-

- Specify a unique `key` that identifies the extension
- The initial `state` that the extension stores
- The `init` function that contains additional logic relating to the extension (eg: listening to state changes)

```tsx
import { createExtension } from '@rekajs/core';

type Comment = {
  userId: string;
  content: string;
};

type CommentState = {
  templateIdToComments: Record<string, Comment[]>;
};

const CommentExtension = createExtension<CommentState>({
  key: 'comments',
  state: {
    // initial state
    comments: {},
  },
  init: (extension) => {
    // do whatever your extension may have to do here
    // ie: send some data to the backend or listen to some changes made in State
  },
});
```

The extension can then be used when creating a new `Reka` instance:

```tsx
import { Reka } from '@rekajs/core';

const CommentExtension = createExtension<CommentState>({...});

const reka = Reka.create({
    state: {...},
    extension: [
        CommentExtension
    ]
})
```

## Mutating an Extension state

An `Extension` state can be accessed with the `.getExtension` method. Mutations are then made the same way as you would mutate a `Program` in the `State`.

For example, let's leave a comment on a root `template` of a component in our state.

```tsx
const rootTemplate = reka.state.components[0].template;

reka.change(() => {
    let templateComments = reka.getExtension(CommentExtension).state.comments[rootTemplate.id];

    if ( !templateComments ) {
        templateComments = {};
        reka.getExtension(CommentExtension).state.comments[rootTemplate.id] = templateComments;
    }

    templateComments.push(
        templateId: rootTemplate.id,
        content: "Yo, this should be a <div>, not a <section>",
    );
})
```

## Keeping the Extension state in-sync

In our Comment Extension example, you may have noticed that a `Comment` has a reference to a `templateId` (which is the `id` of a `Template` node in the `Program` AST).

But what happens when that `Template` gets removed? We probably should remove any `Comment` that is associated with that template as well.

We can do this by listening to `State` changes within the extension itself:

```tsx
import * as t from '@rekajs/types';

const CommentExtension = createExtension<CommentState>({
  key: 'comments',
  state: {
    // initial state
    comments: {},
  },
  init: (extension) => {
    extension.reka.listenToChangeset((payload) => {
      // Get all disposed nodes from the AST
      payload.disposed.forEach((disposedNode) => {
        // If the disposed node is a Template node,
        // Then we should remove all comments associated with the deleted Template node id
        if (t.is(disposedNode, t.Template)) {
          const deletedTemplateId = disposedNode.id;

          // remove any comments associated with the deleted Template
          extension.reka.change(() => {
            delete extension.state.templateToComments[deletedTemplateId.id];
          });
        }
      });
    });
  },
});
```

### Caveat: Extension state cannot store AST nodes

The `Extension` state can hold any type of value **except** instances of Reka's data types. It's unlikely that you ever need to store Reka's data types as part of an extension state, but if you have to - then you could store a serialised version of the data structure instead:

```tsx
createExtension({
  state: {
    // value: t.literal({ value: 10 }) ❌
    value: { type: "Literal", value: 10 } ✅ // or JSON.parse(JSON.stringify(t.literal({ value: 10 })))
  }
})
```
