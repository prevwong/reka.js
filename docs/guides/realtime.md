---
demo: examples/02-collab
---

# Realtime Collaboration

Reka provides an additional `@rekajs/collaboration` package that enables multiplayer capabilities for your page editor.

> This package is powered by `Yjs` - a library for building [CRDTs](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type), it's recommended that you take a look at the official documentation before proceeding.

## Conflict-free Replicated Data Types (CRDT)

CRDT data structures are commonly used to achieve real-time collaboration.

In Reka, the `State` data structure by itself is **not** a CRDT and has no real-time collaborative capabilities; this is by design so we can keep the core of Reka more portable and we don't assume that everyone needs multiplayer features in their page builders, which would otherwise be additional bloat if multiplayer is not an actual requirement.

The `@rekajs/collaboration` package provides an `Extension` where the core `State` data structure is mirrored by a Yjs CRDT.

Whenever there's a change in the `State` data structure:

- These changes are propagated to the mirrored CRDT, and all clients in the network will receive these changes in their own respective CRDTs without conflicts.
- Then, changes from the CRDT structure are applied back to the core `State` structure of each client.

### State Representation

It's also important to note that the way `State` is represented in the CRDT is different. The `State` itself is a nested tree while it is represented as a flat tree in its Yjs CRDT form:

```tsx
// State representation in Reka
{
    type: "State',
    program: {
        type: "Program",
        components: [
            {
                type: "RekaComponent",
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
            type: "RekaComponent",
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
npm install @rekajs/collaboration yjs y-webrtc
```

> We're installing `y-webrtc` to use the WebRTC connector for this example, but you could also use other connectors such as `y-websocket`

## Basic setup

To setup, you need to first create the following via `yjs`:

- A new Yjs `Doc`
- A root `Y.Map` type
  > Note: that `@rekajs/collaboration` stores the actual flatten state in the `document` key of the root `Y.Map` that you provide the extension with
- Create a new `Reka` instance and retrieve the initial `State` from the Yjs document
- Bind a Yjs connector (ie: `y-webrtc`)

```tsx
// app.tsx

import { Reka } from '@rekajs/core';
import * as t from '@rekajs/types';
import { createCollabExtension } from '@rekajs/collaboration';

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

// 1. Create a new Yjs Doc
const doc = new Y.Doc();

// 2. Create a new Y.Map type
// This map will be used to store the flattened Reka state
// Initially, this will be empty; see the section below on how to correctly set the initial state locally
const type = doc.getMap('my-collaborative-editor');)

const CollabExtension = createCollabExtension(type);

// 3. Create a Reka.create instance with an initial State
const reka = Reka.create({
  extensions: [CollabExtension],
});

// 4. Get flattend state from Yjs
const document = type.get('document');

// 5. Restore the Reka state
const state = t.unflatten(document.toJSON());
reka.load(state);

// 6. Bind connector
const provider = new WebrtcProvider('collab-room', doc);
```

### How to set the initial State in Yjs locally with WebRTC

In the above example with WebRTC, we're loading the initial `State` in Reka by getting the state that exists in the Yjs document.

However, as you may expect - the document in Yjs is empty initially, which could be problematic for Yjs in determining the initial state. So, if you would like to set up an initial `State` with some `ComponentComponent`s locally, there're a few extra steps that you will have to do:

#### 1) Create a script that generates a Yjs update

First, we need to create a script that will set up `Reka` and load an initial `State` as usual. We will then manually apply that initial `State` to our Yjs document:

```tsx
// scripts/generate-encoded-initial-update.ts

import { jsToYType } from '@rekajs/collaboration';
import { Reka } from '@rekajs/core';
import * as t from '@rekajs/types';

import * as Y from 'yjs';
import fs from 'fs';

const doc = new Y.Doc();

const type = doc.getMap('my-collaborative-editor');

// Note: don't include the CollabExtension here
// We are setting up a dummy Reka instance here purely to serialise its State for Y.js
const reka = Reka.create();

reka.load(
  t.state({
    program: t.program({
        components: [
            t.rekaComponent(...)
        ]
    }),
  })
);

const flattenState = t.flatten(reka.state);

const { converted } = jsToYType(flattenState);

// Store the state in the "document" key of the Y.Map type:
type.set('document', converted);

const update = Y.encodeStateAsUpdate(doc);

const encoded = Buffer.from(update).toString('base64');

// Finally, save the encoded state value in a separate file:
fs.writeFileSync(
  './generated/encoded-initial-update.ts',
  `export const ENCODED_INITIAL_STATE = '${encoded}';`
);
```

#### 2) Apply the encoded update

Then, in your actual application where you're setting up `Reka` with the `CollabExtension` - just ensure that you apply the encoded update:

```tsx
// app.tsx
import { Reka } from '@rekajs/core';
import * as t from '@rekajs/types';
import { createCollabExtension } from '@rekajs/collaboration';

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

import { ENCODED_INITIAL_STATE } from './generated/encoded-initial-state';

// 1. Create a new Yjs Doc
const doc = new Y.Doc();

// 2. Create a new Y.Map type
// This map will be used to store the flattened Reka state
// Initially, this will be empty; see the section below on how to correctly set the initial state locally
const type = doc.getMap('my-collaborative-editor');)

// 2.5: Apply initial update! <---
Y.applyUpdate(doc, Buffer.from(ENCODED_INITIAL_STATE, 'base64'));

const CollabExtension = createCollabExtension(type);

// 3. Create a Reka.create instance with an initial State
const reka = Reka.create({
  extensions: [CollabExtension],
});

// 4. Get flattend state from Yjs
const document = type.get('document');

// 5. Restore the Reka state
const state = t.unflatten(document.toJSON());
reka.load(state);

// 6. Bind connector
const provider = new WebrtcProvider('collab-room', doc);
```
