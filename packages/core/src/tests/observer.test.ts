import * as t from '@rekajs/types';
import { MockedFunction } from 'vitest';

import { Changeset, Observer } from '../observer';

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

  afterEach(() => {
    observer.dispose();
  });

  describe('parent', () => {
    it('should get parent node correctly', () => {
      expect(observer.getParentNode(tree.children[0])).toMatchObject({
        type: 'TagTemplate',
        tag: 'div',
      });
    });
    it('should get updated immediate parent node correctly', () => {
      const btnChild = t.assert(tree.children[0], t.TagTemplate);
      const sectionChild = t.assert(tree.children[1], t.TagTemplate);

      // Move btnChild from the root div into the section child
      observer.change(() => {
        tree.children.splice(0, 1);
        sectionChild.children.push(btnChild);
      });

      // after the move op, the btnChild's parent node should be the section tpl
      expect(observer.getParentNode(btnChild)).toMatchObject({
        id: sectionChild.id,
      });
    });
  });

  describe('paths', () => {
    let tree: t.TagTemplate;
    let observer: Observer;

    beforeEach(() => {
      tree = t.tagTemplate({
        tag: 'div',
        props: {
          items: t.arrayExpression({
            elements: [t.literal({ value: '0' })],
          }),
        },
        children: [
          t.tagTemplate({
            tag: 'span',
          }),
          t.tagTemplate({
            tag: 'button',
          }),
        ],
      });
      observer = new Observer(tree);
    });

    it('should get correct paths', () => {
      expect(observer.getNodeLocation(tree)).toEqual({
        parent: tree,
        path: [],
      });

      expect(observer.getNodeLocation(tree.props['items'])).toMatchObject({
        parent: {
          type: 'TagTemplate',
        },
        path: ['props', 'items'],
      });

      expect(
        observer.getNodeLocation(tree.props['items']['elements'][0])
      ).toMatchObject({
        parent: {
          type: 'ArrayExpression',
        },
        path: ['elements', 0],
      });

      expect(observer.getNodeLocation(tree.children[0])).toMatchObject({
        parent: {
          type: 'TagTemplate',
          tag: 'div',
        },
        path: ['children', 0],
      });

      expect(observer.getNodeLocation(tree.children[1])).toMatchObject({
        parent: {
          type: 'TagTemplate',
          tag: 'div',
        },
        path: ['children', 1],
      });
    });

    it('should get updated object paths correctly', () => {
      const arrExpr = t.assert(tree.props['items'], t.ArrayExpression);

      expect(observer.getNodeLocation(arrExpr)).toMatchObject({
        parent: {
          type: 'TagTemplate',
          tag: 'div',
        },
        path: ['props', 'items'],
      });

      observer.change(() => {
        delete tree.props['items'];
        tree.props['items2'] = arrExpr;
      });

      expect(observer.getNodeLocation(arrExpr)).toMatchObject({
        parent: {
          type: 'TagTemplate',
          tag: 'div',
        },
        path: ['props', 'items2'],
      });
    });

    it('should get updated array paths correctly', () => {
      const spanChild = t.assert(tree.children[0], t.TagTemplate);
      const btnChild = t.assert(tree.children[1], t.TagTemplate);

      expect(observer.getNodeLocation(spanChild)!.path).toEqual([
        'children',
        0,
      ]);
      expect(observer.getNodeLocation(btnChild)!.path).toEqual(['children', 1]);

      observer.change(() => {
        tree.children.splice(
          1,
          0,
          t.tagTemplate({
            tag: 'text',
          })
        );
      });

      expect(observer.getNodeLocation(spanChild)!.path).toEqual([
        'children',
        0,
      ]);
      expect(observer.getNodeLocation(btnChild)!.path).toEqual(['children', 2]);

      observer.change(() => {
        tree.children.splice(1, 1);
      });

      expect(observer.getNodeLocation(spanChild)!.path).toEqual([
        'children',
        0,
      ]);
      expect(observer.getNodeLocation(btnChild)!.path).toEqual(['children', 1]);
    });
  });

  describe('listenToChangeset', () => {
    let subscriber: MockedFunction<any>;

    const getSubscriberChangesetPayload = (): Changeset => {
      const payload = subscriber.calls[0][0];

      return payload;
    };

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

      const payload = getSubscriberChangesetPayload();

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

    it('should dispose nodes when removed', () => {
      observer.change(() => {
        tree.children.splice(0, 1);
      });

      const payload = getSubscriberChangesetPayload();

      expect(payload.disposed.length).toEqual(1);
      expect(payload.disposed[0]).toMatchObject({
        type: 'TagTemplate',
        tag: 'button',
      });
    });
    it('should not dispose nodes if moved to another part of the tree', () => {
      const btnChild = t.assert(tree.children[0], t.TagTemplate);
      const sectionChild = t.assert(tree.children[1], t.TagTemplate);
      observer.change(() => {
        tree.children.splice(0, 1);
        sectionChild.children.push(btnChild);
      });

      const payload = getSubscriberChangesetPayload();
      expect(payload.disposed.length).toEqual(0);
    });
    it('should not notify change if performing op on an uncommitted value', () => {
      const newTpl = t.tagTemplate({
        tag: 'header',
      });

      observer.change(() => {
        tree.children.push(newTpl);

        newTpl.children.push(
          t.tagTemplate({
            tag: 'svg',
          })
        );
      });

      const payload = getSubscriberChangesetPayload();
      expect(payload.changes.length).toEqual(1);
      expect(payload.changes[0]).toMatchObject({
        type: 'splice',
        index: 2,
        path: ['children'],
        parent: {
          id: tree.id,
        },
        added: [
          {
            id: newTpl.id,
          },
        ],
      });
    });
  });
});
