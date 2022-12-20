# Extensions

Apart from storing the `Program` AST, the `State` could optionally store additional values that your page builder may require.

For example, let's say you want to build a page builder where your end-users are able to leave a comment on a `Template` node of a `CompositeComponent`, similar to what you could do on apps like Figma. 

One way to go about this is store these comments directly as part of the `State`, through an Extension.

## Creating an Extension

```tsx
import { createExtension } from '@composite/state';

type Comment = {
    templateId: string;
    content: string;
};

type CommentState = {
    comments: Comment[];
};

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
```

The extension can then be used when creating a new `Composite` instance:

```tsx
import { Composite } from '@composite/state';

const CommentExtension = createExtension<CommentState>({...});

const composite = new Composite({
    state: {...},
    extension {
        CommentExtension
    }
})
```

## Mutating an Extension state

An `Extension` state can be accessed with the `.getExtensionState` method. Mutations are then made the same way as you would mutate a `Program` in the `State`.

For example, let's leave a comment on a root `template` of one our components in our state.

```tsx
const rootTemplate = composite.state.components[0].template;

composite.change(() => {
    composite.getExtensionState(CommentExtension).comments.push(
        templateId: rootTemplate.id,
        content: "Yo, this should be a <div>, not a <section>",
    );
})
```

## Keeping Extension state in-sync

In our Comment Extension example, you may have noticed that a `Comment` has a reference to a `templateId` (which is the `id` of a `Template` node in the `Program` AST). 

But what happens when that `Template` gets removed? We probably should remove any `Comment` that is associated with that template as well. 

We can do this by listening to `State` changes within the extension itself: 

```tsx
import * as t from '@composite/types';

const CommentExtension = createExtension<CommentState>({
    key: 'comments', 
    state: {
        // initial state
        comments: []
    },
    init: extension => {
        extension.composite.listenToChanges((payload) => {
            if ( payload.type !== "disposed" ) {
                return;
            }

            const deletedValue = payload.value;

            if ( deletedValue instanceof t.Template ) {
                const deletedTemplateId = deletedValue.id;

                // remove any comments associated with the deleted Template
                extension.composite.change(() => {
                    extension.state.comments.forEach(comment => {
                        if ( comment.templateId !== deletedTemplateId ) {
                            return;
                        }

                        extension.state.comments.splice(extension.state.comments.indexOf(comment), 1)
                    })
                })
            }
        });
    }
});
```