import { getCollaborativeYjsType } from '@app/utils';
import { CollabExtensionFactory } from '@composite/collaborative';

export const CollabExtension = CollabExtensionFactory(
  getCollaborativeYjsType()
);
