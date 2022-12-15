import { CollabExtensionFactory } from '@composite/collaborative';

import { getCollaborativeYjsType } from '@app/utils';

export const CollabExtension = CollabExtensionFactory(
  getCollaborativeYjsType()
);
