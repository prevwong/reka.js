import { State } from '@composite/state';
import { YjsCompositeSyncProvider, jsToYType } from '@composite/collaborative';
import * as t from '@composite/types';

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

const loadInitialDocument = (state: State, type: Y.Map<any>) => {
  const existingDocument = type.get('document');
  if (existingDocument) {
    const existingState = t.unflattenType(existingDocument.toJSON());
    state.replace(existingState);
    return;
  }

  const flattenState = t.flattenType(state.state);
  const { converted } = jsToYType(flattenState);

  type.set('document', converted);
};

export const setupExperimentalCollaborationSync = (state: State) => {
  const doc = new Y.Doc();
  const type = doc.getMap('root');

  const crdt = new YjsCompositeSyncProvider(state, type);

  (window as any).crdt = crdt;

  crdt.sync();

  const webrtcProvider = new WebrtcProvider('composite-yjs-test', doc);

  // webrtcProvider.signalingConns.map((c) => {
  //   return c.once('connect', () => {
  loadInitialDocument(state, type);
  //   });
  // });

  return [crdt, webrtcProvider] as const;
};
