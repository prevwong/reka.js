import * as t from '@composite/types';
import { State } from '@composite/state';

import * as Y from 'yjs';

import { getTypePathFromMobxChangePath, jsToYType, yTypeToJS } from './utils';

export class YjsCompositeSyncProvider {
  private loaded: boolean = false;
  private mobxChangesToSync: any[] = [];
  private isBatchingMobxChanges = false;
  private isSynchingToMobx = false;

  private declare compositeChangeUnsubscriber: () => void;
  private yDocChangeListener: (events: any, tr: any) => void;

  root: Y.Map<any>;
  yDoc: Y.Doc;

  constructor(readonly state: State, type: Y.Map<any>) {
    if (!type.doc) {
      throw new Error();
    }

    this.yDoc = type.doc;
    this.root = type;

    this.yDocChangeListener = (events, tr) => {
      if (!this.state) {
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
    this.yDoc.getMap('root').unobserveDeep(this.yDocChangeListener);
    this.compositeChangeUnsubscriber();
  }

  private withMobxSync(cb: () => void) {
    const prev = this.isSynchingToMobx;
    this.isSynchingToMobx = true;
    cb();
    this.isSynchingToMobx = prev;
  }

  get document() {
    return this.root.get('document');
  }

  syncToState(event: Y.YEvent<any>) {
    if (event.transaction.origin === this) {
      return;
    }

    const toJsObject = (root: Y.Map<any>, paths: any[]): any => {
      // mutating a type object property
      if (paths[0] === 'types' && paths.length > 1) {
        const traverse = (value: any, paths) => {
          if (paths.length === 0) {
            return value;
          }

          const curr = paths.shift();

          return traverse(value[curr], paths);
        };

        return traverse(this.state.getTypeFromId(paths[1]), paths.slice(2));
      }

      return null;
    };

    const yDocRoot = this.document as Y.Map<any>;

    if (event.path.length === 0) {
      return;
    }

    this.state.change(() => {
      // console.log("synching to state", event);
      const obj = toJsObject(yDocRoot, [...event.path.slice(1)]);

      if (!obj) {
        return;
      }

      // TODO: this is currently not handling deletions
      if (event instanceof Y.YMapEvent) {
        event.keysChanged.forEach((key) => {
          obj[key] = yTypeToJS(
            this.state,
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
                this.state,
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

        const yDocRoot = this.root.get('document') as Y.Map<any>;

        changes.forEach((change) => {
          if (change.type === 'replace') {
            return;
          }

          const path = getTypePathFromMobxChangePath([...change.path]);

          const getYTypeFromPath = (paths: any[]) => {
            const rootType = paths.shift();

            const traverse = (obj, paths) => {
              const curr = paths.shift();

              if (curr === undefined) {
                return obj;
              }

              let target = obj.get(curr);

              if (target.get('$$typeId') !== undefined) {
                target = yDocRoot.get('types').get(target.get('$$typeId'));
              }

              return traverse(target, paths);
            };

            const type = yDocRoot.get('types').get(rootType.id);

            return traverse(type, paths);
          };

          const yType = getYTypeFromPath([...path]);

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

              const typesToRemove = t.collectNestedTypes(change.oldValue);

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
                const typesToRemove = t.collectNestedTypes(r).map((x) => x.id);

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

  sync() {
    // Listen to Composite state changes
    this.compositeChangeUnsubscriber = this.state.listenToChanges((change) => {
      if (this.isSynchingToMobx) {
        return;
      }

      this.mobxChangesToSync.push(change);

      if (this.isBatchingMobxChanges) {
        return;
      }

      this.isBatchingMobxChanges = true;

      Promise.resolve().then(() => {
        console.log('mobx', this.mobxChangesToSync);
        this.syncMobxChangesToYDoc(this.mobxChangesToSync);
        this.mobxChangesToSync = [];
        this.isBatchingMobxChanges = false;
      });
    });

    // Listen to Y.js doc changes
    this.yDoc.getMap('root').observeDeep(this.yDocChangeListener);
  }

  destroy() {
    if (this.compositeChangeUnsubscriber) {
      this.compositeChangeUnsubscriber();
    }

    this.yDoc.getMap('root').unobserveDeep(this.yDocChangeListener);
  }

  private loadInitialDocument() {
    const existingDocument = this.root.get('document');
    if (existingDocument) {
      const existingState = t.unflattenType(existingDocument.toJSON());
      this.state.replace(existingState);
      return;
    }

    const flattenState = t.flattenType(this.state.root);
    const { converted } = jsToYType(flattenState);

    this.root.set('document', converted);
  }

  load() {
    if (this.loaded) {
      return;
    }

    this.loaded = true;
    this.loadInitialDocument();
  }
}
