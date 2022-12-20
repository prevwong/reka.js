# Realtime Collaboration

The dreaded task of synching changes made to your page builder. Luckily, Composite has an external package that does all the hard work for us.

`@composite/collaboration` is powered by `yjs`, so it's recommended that you get familiar with some of its concepts.

## Installation

```
npm install @composite/collaboration yjs y-webrtc
```

> We're installing `y-webrtc` to use Yjs' WebRTC connector for this example, but you could also use other connectors such as `y-websocket`


## Setup

```tsx
import { Composite } from '@composite/state';
import { CollabExtensionFactory } from '@composite/collaboration';

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

const doc = new Y.Doc();
const type = doc.getMap('my-collaborative-document');

const CollabExtension = CollabExtensionFactory(type);

const composite = new Composite({
    extensions: [CollabExtension]
});

const provider = new WebrtcProvider(
    'collab-room',
    doc
);
```