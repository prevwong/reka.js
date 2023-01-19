import { createCollabExtension } from '@rekajs/collaborative';

import { getCollaborativeYjsType } from '@app/utils';

export const CollabExtension = createCollabExtension(getCollaborativeYjsType());
