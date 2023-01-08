# Realtime Collaboration

Composite provides an additional `@composite/collaboration` package which enables multiplayer capabilities for your page editor.

> This package is powered by `Yjs` - a library for building [CRDTs](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type), it's recommended that you take a look at the official documentation before proceeding.  


## Conflict-free Replicated Data Types (CRDT) 

CRDT data structures are one of the ways to achieve realtime collaboration. In Composite, the `State` data structure by itself is **not** a CRDT and has no realtime collaborative capabilities; this is by design so we can keep the core of Composite more portable and we don't assume that everyone needs multiplayer features in their page builders, which would otherwise be additional bloat if multiplayer is not a requirement.

The `@composite/collaboration` package provides a Composite `Extension` where the core `State` data structure is mirrored by a Yjs CRDT. 

Whenever there's a change that happens in the core `State` structure:
- The changes are propagated to the mirrored CRDT, and all clients across the network will receive these changes in their own respective CRDTs without merge conflicts.
- When clients across the network receives the changes in the mirrored CRDT structure, these changes are then finally applied back to the core `State` structure.


### State Representation

It's also important to note that the way `State` is represented in the CRDT is different. `State` itself is a nested tree while it is represented as a flat tree in its Yjs CRDT form:

```tsx
// State representation in Composite
{
    type: "State',
    program: {
        type: "Program",
        components: [
            {
                type: "CompositeComponent",
                state: [],
                props: [],
                template: null,
            }
        ]
    }
};

// Flatten State representation in Yjs-CRDT
{
    types: {
        "state-id": {
            type: "State",
            program: "program-id",
        },
        "program-id": {
            type: "Program",
            components: ["component-id"]
        },
        "component-id": {
            type: "CompositeComponent",
            state: [],
            props: [],
            template: null,
        }
    },
    root: "state-id",
}
```

## Installation

```
npm install @composite/collaboration yjs y-webrtc
```

> We're installing `y-webrtc` to use the WebRTC connector for this example, but you could also use other connectors such as `y-websocket`


## Basic setup

To setup, you need to first create the following via `yjs`:
- A new Yjs `Doc` (`new Y.Doc()`)
- A root `Y.Map` type (`.getMap(...)`)
  > Note: that `@composite/collaboration` stores the actual flatten state in the `document` key of the root `Y.Map` that you provide the extension with
- Create a new Composite instance and retrieve intiial `State` from the Yjs document
- Bind a Yjs connector (ie: `y-webrtc`)


```tsx
// app.tsx

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

### WebRTC extra: How to set initial State in Yjs locally

In the above example with WebRTC, we're loading the initial `State` in Composite by getting the state that exists in the Yjs document. 

However, as you may expect - the document in Yjs is empty initially. So, if you would like to setup an initial `State` with some `ComponentComponent`s locally, there're a few extra steps that you will have to do:

#### 1) Create a script that generates a Yjs update 

First, we need to create a script that will setup `Composite` and load an initial `State` as usual. We will then manually apply the initial `State` to our Yjs document:

```tsx
// scripts/generate-encoded-initial-update.ts

import { jsToYType } from '@composite/collaborative';
import { Composite } from '@composite/state';
import * as t from '@composite/types';

import * as Y from 'yjs';
import fs from 'fs';

const doc = new Y.Doc();

const type = doc.getMap('my-collaborative-editor');

const composite = new Composite();

composite.load(
  t.state({
    program: t.program({
        components: [
            t.compositeComponent(...)
        ]
    }),
  })
);

const flattenState = t.flattenType(composite.state);

const { converted } = jsToYType(flattenState);

type.set('document', converted);

const update = Y.encodeStateAsUpdate(doc);

const encoded = Buffer.from(update).toString('base64');

fs.writeFileSync(
  './contants/encoded-initial-update.ts',
  `export const ENCODED_INITIAL_UPDATE = '${encoded}';`
);
```

#### 2) Apply the encoded update

Then, in your actual application where you're setting up `Composite` with the `CollabExtension` - just ensure that you apply the encoded update:

```tsx
// app.tsx
import { Composite } from '@composite/state';
import * as t from '@composite/types';
import { createCollabExtension } from '@composite/collaboration';

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

import { ENCODED_INITIAL_UPDATE } from './constants/encoded-initial-update';

// 1. Create a new Yjs Doc
const doc = new Y.Doc();

// 2. Create a new Y.Map from the Doc
const type = doc.getMap('my-collaborative-editor');
// Note: The flattened State is actually stored in type.getMap('document');

// 2.5: Apply initial update! <--- 
Y.applyUpdate(doc, Buffer.from(ENCODED_INITIAL_UPDATE, 'base64'));

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