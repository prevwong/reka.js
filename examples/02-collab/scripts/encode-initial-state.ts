import { jsToYType } from '@rekajs/collaboration';
import { Reka } from '@rekajs/core';
import * as t from '@rekajs/types';

import * as Y from 'yjs';
import fs from 'fs';

import { INITIAL_STATE } from '@/constants/state';

const doc = new Y.Doc();

const type = doc.getMap('my-collaborative-editor');

// Note: don't include the CollabExtension here
// We are setting up a dummy Reka instance here purely to serialise its State for Y.js
const reka = Reka.create();

reka.load(INITIAL_STATE);

const flattenState = t.flatten(reka.state);

const { converted } = jsToYType(flattenState);

type.set('document', converted);

const update = Y.encodeStateAsUpdate(doc);

const encoded = Buffer.from(update).toString('base64');

// Finally, save the encoded state value in a separate file:
fs.writeFileSync(
  './src/generated/encoded-initial-state.ts',
  `export const ENCODED_INITIAL_STATE = '${encoded}';`
);
