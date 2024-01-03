import { createExtension } from '@rekajs/core';
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
    extension.reka.listenToChangeset((change) => {
      if (
        change.source === 'history' ||
        change.disposed.length === 0 ||
        change.disposed.every((disposed) => !t.is(disposed, t.Template))
      ) {
        return;
      }

      extension.reka.change(() => {
        change.disposed.map((disposedType) => {
          if (!(disposedType instanceof t.Template)) {
            return;
          }

          delete extension.state.templateToComments[disposedType.id];
        });
      });
    });
  },
});
