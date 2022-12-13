import { ENCODED_DUMMY_PROGRAM, Y_ROOT_DOCUMENT } from '@app/constants';

import invariant from 'tiny-invariant';
import * as Y from 'yjs';

const doc = new Y.Doc();
const type = doc.getMap<{ document: any }>(Y_ROOT_DOCUMENT);
const myBuffer = Buffer.from(ENCODED_DUMMY_PROGRAM, 'base64');
Y.applyUpdate(doc, myBuffer);

export const getCollaborativeYjsDocument = () => {
  return doc;
};

export const getCollaborativeYjsType = () => {
  return type;
};

export const getCollaborativeYjsCompositeState = () => {
  const document = type.get('document');

  invariant(
    document && document instanceof Y.Map,
    'Collaborative document not found!'
  );

  return document;
};
