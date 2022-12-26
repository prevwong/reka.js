import { createExtension } from '@composite/state';
import * as t from '@composite/types';

export type Comment = {
  userId: string;
  content: string;
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
