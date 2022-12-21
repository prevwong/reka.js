import { createExtension } from '@composite/state';
import invariant from 'tiny-invariant';
import * as Y from 'yjs';

import { YjsCompositeSyncProvider } from './YjsCompositeSyncProvider';

const CompositeToYSyncProviders = new WeakMap();

export const createCollabExtension = (type: Y.Map<any>) =>
  createExtension({
    key: 'collaboration',
    init: (ext) => {
      const syncProvider = new YjsCompositeSyncProvider(ext.composite, type);
      CompositeToYSyncProviders.set(ext.composite, syncProvider);
      syncProvider.init();
    },
    dispose: (ext) => {
      const syncProvider = CompositeToYSyncProviders.get(ext.composite);

      invariant(
        syncProvider,
        'Cannot resolve Composite to YjsCompositeSyncProvider'
      );

      syncProvider.dispose();
    },
  });
