import { createExtension } from '@composite/state';
import * as t from '@composite/types';

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
    extension.composite.listenToChanges((change) => {
      if (change.event !== 'dispose') {
        return;
      }

      const disposedType = change.type;

      if (disposedType instanceof t.Template) {
        return;
      }

      extension.composite.change(() => {
        delete extension.state.templateToComments[disposedType.id];
      });
    });
  },
});
