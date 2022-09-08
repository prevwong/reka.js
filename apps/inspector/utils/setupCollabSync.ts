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

  const flattenState = t.flattenType(state.data);
  const { converted } = jsToYType(flattenState);

  type.set('document', converted);
};

export const setupExperimentalCollaborationSync = (state: State) => {
  const doc = new Y.Doc();
  const type = doc.getMap('root');

  const crdt = new YjsCompositeSyncProvider(state, type);

  // (window as any).crdt = crdt;

  crdt.sync();

  let webrtcProvider: WebrtcProvider;

  if (typeof window !== 'undefined') {
    webrtcProvider = new WebrtcProvider('composite-yjs-test', doc);
    webrtcProvider.signalingConns.map((c) => {
      return c.once('connect', () => {
        loadInitialDocument(state, type);
      });
    });
  }

  // @ts-ignore
  return [crdt, webrtcProvider] as [YjsCompositeSyncProvider, WebrtcProvider];
};
