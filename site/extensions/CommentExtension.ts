import { createExtension } from '@rekajs/state';
import * as t from '@rekajs/types';

import { User } from '@app/editor/Editor';

export type Comment = {
  user: User;
  content: string;
  date: number;
};

type TemplateId = string;

type CommentState = {
  templateToComments: Record<TemplateId, Comment[]>;
};

export const CommentExtension = createExtension<CommentState>({
  key: 'comments',
  state: {
    templateToComments: {},
  },
  init: (extension) => {
    extension.reka.listenToChanges((change) => {
      if (change.event !== 'dispose') {
        return;
      }

      const disposedType = change.type;

      if (disposedType instanceof t.Template) {
        return;
      }

      extension.reka.change(() => {
        delete extension.state.templateToComments[disposedType.id];
      });
    });
  },
});
