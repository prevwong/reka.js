import { Reka, Changeset } from '@rekajs/core';
import * as t from '@rekajs/types';
import { getRandomId, invariant } from '@rekajs/utils';
import * as Y from 'yjs';

import { getTypePathFromMobxChangePath, jsToYType, yTypeToJS } from './utils';

export class YjsRekaSyncProvider {
  id: string;

  private declare rekaChangeUnsubscriber: () => void;

  private yDocChangeListener: (
    events: Y.YEvent<any>[],
    tr: Y.Transaction
  ) => void;

  private yDoc: Y.Doc;

  constructor(readonly reka: Reka, readonly type: Y.Map<any>, id?: string) {
    this.id = id ?? getRandomId();

    if (!type.doc) {
      throw new Error();
    }

    this.yDoc = type.doc;

    if (typeof window !== 'undefined') {
      (window as any).crdt = this;
    }

    this.yDocChangeListener = (events, tr) => {
      if (!this.reka) {
        return;
      }

      if (tr.origin === this) {
        return;
      }

      this.withMobxSync(() => {
        events.forEach((event) => this.syncYEventToState(event));
      });
    };
  }

  dispose() {
    this.type.unobserveDeep(this.yDocChangeListener);
    this.rekaChangeUnsubscriber();
  }

  private withMobxSync(cb: () => void) {
    this.reka.change(
      () => {
        cb();
      },
      {
        source: this.changesetSourceKey,
      }
    );
  }

  get yRekaDocument() {
    return this.type.get('document');
  }

  get changesetSourceKey() {
    return `yjs-sync-${this.id}`;
  }

  syncYEventToState(event: Y.YEvent<any>) {
    // No need to do anything if the event is from the sync mechanism below
    if (event.transaction.origin === this) {
      return;
    }

    const toJsObject = (paths: any[]): any => {
      // mutating a type object property
      if (paths[0] === 'types' && paths.length > 1) {
        const traverse = (value: any, paths) => {
          if (paths.length === 0) {
            return value;
          }

          const curr = paths.shift();

          return traverse(value[curr], paths);
        };

        return traverse(this.reka.getNodeFromId(paths[1]), paths.slice(2));
      }

      return null;
    };

    const yDocRoot = this.yRekaDocument as Y.Map<any>;

    if (event.path.length === 0) {
      return;
    }

    const obj = toJsObject([...event.path.slice(1)]);

    if (!obj) {
      return;
    }

    if (event instanceof Y.YMapEvent) {
      if (event.keys.size === 0) {
        return;
      }

      event.keysChanged.forEach((key) => {
        obj[key] = yTypeToJS(
          this.reka,
          yDocRoot.get('types'),
          (event.target as Y.Map<any>).get(key)
        );
      });
    } else if (event instanceof Y.YArrayEvent) {
      for (let i = 0, j = 0; i < event.delta.length; i++) {
        const delta = event.delta[i];

        if (delta.retain !== undefined) {
          j += delta.retain;
          continue;
        }

        if (delta.delete) {
          obj.splice(j, delta.delete);
          j = j - delta.delete + 1;
          continue;
        }

        if (delta.insert) {
          const m = (delta.insert as any[]).map((item) => {
            const converted = yTypeToJS(this.reka, yDocRoot.get('types'), item);

            return converted;
          });

          obj.splice(j, 0, ...m);
          j += Array.isArray(delta.insert) ? delta.insert.length : 1;
          continue;
        }
      }
    }
  }

  syncStateChangesetToYDoc(changeset: Changeset) {
    Y.transact(
      this.yDoc,
      () => {
        let removed: any[] = [];
        let insert: Record<string, any> = {};

        const yDocRoot = this.yRekaDocument;

        changeset.disposed.forEach((dispose) => {
          const typeIdToDispose = dispose.id;
          yDocRoot.get('types').delete(typeIdToDispose);
        });

        changeset.changes.forEach((change) => {
          const path = getTypePathFromMobxChangePath([...change.path]);

          const getTypeFromId = (id: string) => {
            return yDocRoot.get('types').get(id);
          };

          const getYTypeFromPath = (paths: any[]) => {
            const rootType = paths.shift();

            const traverse = (obj, paths) => {
              const curr = paths.shift();

              if (curr === undefined) {
                return obj;
              }

              let target = obj.get(curr);

              if (target.get('$$typeId') !== undefined) {
                target = getTypeFromId(target.get('$$typeId'));
              }

              return traverse(target, paths);
            };

            const type = getTypeFromId(rootType.id);

            /**
             * There's an edge case when we cannot resolve the root type from the Yjs Document
             *
             * This is when we just added a new Node and we instantly mutate a property in that node. For example:
             * reka.change(() => {
             *    // New node created here
             *    template.classList = t.objectExpression({...})
             *
             *    // Instantly modifiying a property of the newly created noew
             *    template.classList.properties['bg-blue-900'] = true;
             * });
             *
             * In this case, we can safely abort making changes to the yDoc since the newly created node is stored in the "insert" array
             * and any subsequent changes will be reflected in the newly created node anyway
             */
            if (!type) {
              return;
            }

            return traverse(type, paths);
          };

          const yType = getYTypeFromPath([...path]);

          if (!yType) {
            return;
          }

          if (yType instanceof Y.Map) {
            invariant(
              change.observableKind === 'object',
              'Expected value to sync with Y.Map is not an object'
            );

            if (change.type === 'add' || change.type === 'update') {
              const newValue = jsToYType(change.newValue);
              insert = {
                ...insert,
                ...newValue.typesToInsert,
              };

              yType.set(String(change.name), newValue.converted);
            }
          } else if (yType instanceof Y.Array) {
            invariant(
              change.observableKind === 'array',
              'Expected value to sync with Y.Array is not an array'
            );

            if (change.type === 'update') {
              const newValue = jsToYType(change.newValue);

              const typesToRemove = t.collect(change.oldValue);

              yType.delete(change.index);
              yType.insert(change.index, [newValue.converted]);

              removed = [...removed, ...typesToRemove.map((t) => t.id)];

              insert = {
                ...insert,
                ...newValue.typesToInsert,
              };

              return;
            }

            if (change.removedCount > 0) {
              change.removed.forEach((r) => {
                const typesToRemove = t.collect(r).map((x) => x.id);

                removed = [...removed, ...typesToRemove];
              });

              yType.delete(change.index, change.removedCount);
            }

            if (change.addedCount > 0) {
              const arrayItems = change.added.map((added) => {
                const newValue = jsToYType(added);

                insert = {
                  ...insert,
                  ...newValue.typesToInsert,
                };

                return newValue.converted;
              });

              yType.insert(change.index, arrayItems);
            }
          }
        });

        Object.keys(insert).forEach((typeToInsertId) => {
          if (removed.includes(typeToInsertId)) {
            return;
          }

          yDocRoot.get('types').set(typeToInsertId, insert[typeToInsertId]);
        });

        removed.forEach((typeToRemoveId) => {
          if (Object.keys(insert).includes(typeToRemoveId)) {
            return;
          }

          yDocRoot.get('types').delete(typeToRemoveId);
        });
      },
      this
    );
  }

  init() {
    // Listen to Y.js doc changes
    this.type.observeDeep(this.yDocChangeListener);

    // Listen to Reka state changes
    this.rekaChangeUnsubscriber = this.reka.listenToChangeset((changeset) => {
      if (changeset.source === this.changesetSourceKey) {
        return;
      }

      if (changeset.changes.length === 0) {
        return;
      }

      this.syncStateChangesetToYDoc(changeset);
    });
  }
}
