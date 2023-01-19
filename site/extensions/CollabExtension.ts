import { createCollabExtension } from '@rekajs/collaboration';

import { getCollaborativeYjsType } from '@app/utils';

export const CollabExtension = createCollabExtension(getCollaborativeYjsType());
