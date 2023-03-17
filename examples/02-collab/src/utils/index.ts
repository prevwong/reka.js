import { createCollabExtension } from '@rekajs/collaboration';
import { Reka } from '@rekajs/core';
import * as t from '@rekajs/types';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';

import { ENCODED_INITIAL_STATE } from '@/generated/encoded-initial-state';

let webrtcProvider: WebrtcProvider;

// Setup a new Reka instance and Yjs
export const setup = () => {
  // 1. Create a new Yjs Doc
  const doc = new Y.Doc();

  // 2. Create a new Y.Map type
  // This map will be used to store the flattened Reka state
  // Initially, this will be empty; see the section below on how to correctly set the initial state
  const type = doc.getMap('my-collaborative-editor');

  // 2.5: Apply initial update! <---
  Y.applyUpdate(doc, Buffer.from(ENCODED_INITIAL_STATE, 'base64'));

  const CollabExtension = createCollabExtension(type);

  // 3. Create a Reka.create instance with an initial State
  const reka = Reka.create({
    extensions: [CollabExtension],
  });

  // 4. Get flattend state from Yjs
  const document = type.get('document');

  if (!(document instanceof Y.Map)) {
    throw new Error();
  }

  // 5. Restore the Reka state
  const state = t.unflatten(document.toJSON() as any);
  reka.load(state);

  // Need to check if window is available because we cannot setup WebRTC/WebSockets on the server
  if (typeof window !== 'undefined') {
    // 6. Bind connector
    webrtcProvider = new WebrtcProvider('collab-room', doc);
  }

  return reka;
};

export const getWebrtcProvider = () => {
  if (!webrtcProvider) {
    throw new Error(
      `WebRTC provider not initialised. Ensure that setup() is called and you're not attempting to access the WebRTC provider on the server`
    );
  }

  return webrtcProvider;
};
