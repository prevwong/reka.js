import * as t from '@rekajs/types';
import { MockedFunction } from 'vitest';

import { Observer } from '../observer';

describe('observer', () => {
  let tree: t.TagTemplate;
  let observer: Observer<t.TagTemplate>;

  beforeEach(() => {
    tree = t.tagTemplate({
      tag: 'div',
      props: {},
      children: [
        t.tagTemplate({
          tag: 'button',
          props: {},
        }),
        t.tagTemplate({
          tag: 'section',
        }),
      ],
    });

    observer = new Observer(tree, {
      batch: true,
    });
  });

  describe('subscriber', () => {
    let subscriber: MockedFunction<any>;

    beforeEach(() => {
      subscriber = vi.fn();

      observer.listenToChangeset(subscriber);
    });

    it('should batch changes', () => {
      observer.change(() => {
        const btn = tree.children[0];
        tree.children.splice(0, 1);
        tree.children.splice(1, 0, btn);
      });

      expect(subscriber).toHaveBeenCalledTimes(1);

      const payload = subscriber.calls[0][0];
      expect(payload.added.length).toEqual(0);
      expect(payload.disposed.length).toEqual(0);
      expect(payload.changes.length).toEqual(2);
      expect(payload.changes[0]).toMatchObject({
        observableKind: 'array',
        type: 'splice',
        index: 0,
        removedCount: 1,
      });
      expect(payload.changes[1]).toMatchObject({
        observableKind: 'array',
        type: 'splice',
        index: 1,
        addedCount: 1,
      });
    });
  });
});
