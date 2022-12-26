import { Composite } from '@composite/state';
import * as t from '@composite/types';
import * as Y from 'yjs';

import { getTypePathFromMobxChangePath, jsToYType, yTypeToJS } from './utils';

export class YjsCompositeSyncProvider {
  private mobxChangesToSync: any[] = [];
  private isBatchingMobxChanges = false;
  private isSynchingToMobx = false;

  private declare compositeChangeUnsubscriber: () => void;
  private yDocChangeListener: (events: any, tr: any) => void;

  private yDoc: Y.Doc;

  constructor(readonly composite: Composite, readonly type: Y.Map<any>) {
    if (!type.doc) {
      throw new Error();
    }

    this.yDoc = type.doc;

    this.yDocChangeListener = (events, tr) => {
      if (!this.composite) {
        return;
      }

      if (tr.origin === this) {
        return;
      }

      this.withMobxSync(() => {
        events.forEach((event) => this.syncToState(event));
      });
    };
  }

  dispose() {
    this.type.unobserveDeep(this.yDocChangeListener);
    this.compositeChangeUnsubscriber();
  }

  private withMobxSync(cb: () => void) {
    const prev = this.isSynchingToMobx;
    this.isSynchingToMobx = true;
    cb();
    this.isSynchingToMobx = prev;
  }

  get yCompositeDocument() {
    return this.type.get('document');
  }

  syncToState(event: Y.YEvent<any>) {
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

        return traverse(this.composite.getNodeFromId(paths[1]), paths.slice(2));
      }

      return null;
    };

    const yDocRoot = this.yCompositeDocument as Y.Map<any>;

    if (event.path.length === 0) {
      return;
    }

    this.composite.change(() => {
      // console.log("synching to state", event);
      const obj = toJsObject([...event.path.slice(1)]);

      if (!obj) {
        return;
      }

      // TODO: this is currently not handling deletions
      if (event instanceof Y.YMapEvent) {
        event.keysChanged.forEach((key) => {
          obj[key] = yTypeToJS(
            this.composite,
            yDocRoot.get('types'),
            (event.target as Y.Map<any>).get(key)
          );
        });
      } else if (event instanceof Y.YArrayEvent) {
        // console.log("yjs  arr sevent", event);
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
              const converted = yTypeToJS(
                this.composite,
                yDocRoot.get('types'),
                item
              );

              // console.log("item", item, converted);

              return converted;
            });

            obj.splice(j, 0, ...m);
            j += Array.isArray(delta.insert) ? delta.insert.length : 1;
            continue;
          }
        }
      }
    });
  }

  syncMobxChangesToYDoc(changes) {
    Y.transact(
      this.yDoc,
      () => {
        let removed: any[] = [];
        let insert: Record<string, any> = {};

        const yDocRoot = this.yCompositeDocument;

        changes.forEach((change) => {
          if (change.type === 'replace') {
            return;
          }

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
             * composite.change(() => {
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
            const newValue = jsToYType(change.newValue);
            insert = {
              ...insert,
              ...newValue.typesToInsert,
            };

            yType.set(change.name, newValue.converted);
          } else if (yType instanceof Y.Array) {
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
    // Listen to Composite state changes
    this.compositeChangeUnsubscriber = this.composite.listenToChanges(
      (change) => {
        if (change.event !== 'change') {
          return;
        }

        if (this.isSynchingToMobx) {
          return;
        }

        this.mobxChangesToSync.push(change);

        if (this.isBatchingMobxChanges) {
          return;
        }

        this.isBatchingMobxChanges = true;

        Promise.resolve().then(() => {
          this.syncMobxChangesToYDoc(this.mobxChangesToSync);
          this.mobxChangesToSync = [];
          this.isBatchingMobxChanges = false;
        });
      }
    );

    // Listen to Y.js doc changes
    this.type.observeDeep(this.yDocChangeListener);
  }
}
