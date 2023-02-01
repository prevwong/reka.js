import { getRandomId, invariant } from '@rekajs/utils';
import * as Y from 'yjs';

import { ENCODED_DUMMY_PROGRAM, Y_ROOT_DOCUMENT } from '@app/constants';

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

export const getCollaborativeYjsRekaState = () => {
  const document = type.get('document');

  invariant(
    document && document instanceof Y.Map,
    'Collaborative document not found!'
  );

  return document;
};

/**
 * Get room name to join via WebRTC
 * Note: Generating a random room id for each machine to prevent the demo on the production site to be altered
 */
export const getCollabRoomId = () => {
  const RANDOM_ROOM_ID_LOCALSTORAGE_KEY = 'rekajs-site-random-room-id';

  let randomRoomId = localStorage.getItem(RANDOM_ROOM_ID_LOCALSTORAGE_KEY);

  if (!randomRoomId) {
    randomRoomId = getRandomId();
    localStorage.setItem(RANDOM_ROOM_ID_LOCALSTORAGE_KEY, randomRoomId);
  }

  return `reka-yjs-test-${randomRoomId}`;
};
