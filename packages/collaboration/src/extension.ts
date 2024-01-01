import { createExtension } from '@rekajs/core';
import { invariant } from '@rekajs/utils';
import * as Y from 'yjs';

import { YjsRekaSyncProvider } from './YjsRekaSyncProvider';
import { RekaToYSyncProviders } from './store';


export const createCollabExtension = (type: Y.Map<any>) =>
  createExtension({
    key: 'collaboration',
    init: (ext) => {
      const syncProvider = new YjsRekaSyncProvider(ext.reka, type);
      RekaToYSyncProviders.set(ext.reka, syncProvider);
      syncProvider.init();
    },
    dispose: (ext) => {
      const syncProvider = RekaToYSyncProviders.get(ext.reka);

      invariant(syncProvider, 'Cannot resolve Reka to YjsRekaSyncProvider');

      syncProvider.dispose();
    },
  });
