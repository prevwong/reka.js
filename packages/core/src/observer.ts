import * as t from '@rekajs/types';
import { getRandomId, invariant } from '@rekajs/utils';
import {
  IArraySplice,
  IArrayUpdate,
  IObjectDidChange,
  IObservable,
  IObservableArray,
  computed,
  isObservable,
  isObservableArray,
  makeObservable,
  observable,
  observe,
  runInAction,
} from 'mobx';

import { noop } from './utils';

type ValuesWithReference = Array<any> | Record<string, any> | t.Type;

type ValueTraversalInfo = {
  nearestParentNode: t.Type;
  parentValue: ValuesWithReference;
  parentKey: string | number;
};

type Location = {
  parent: t.Type;
  path: Array<string | number>;
};

type Disposer = () => void;

export type MobxChangePayload = IObjectDidChange | IArraySplice | IArrayUpdate;

export type ObserverAddPayload = {
  type: t.Type;
};

export type ObserverDiposePayload = {
  type: t.Type;
};

export type ObserverChangePayload = MobxChangePayload & Location;

export type ObserverHooks = {
  onAdd: (payload: ObserverAddPayload) => void;
  onChange: (payload: ObserverChangePayload) => void;
  onDispose: (payload: ObserverDiposePayload) => void;
};

export type ObserverOptions = {
  id?: string;
  batch: boolean;
  shouldIgnoreObservable: (parent: t.Type, key: string, value: any) => boolean;
  hooks: Partial<ObserverHooks>;
  resolveProp: t.Tree['resolveProp'];
};

export type ChangeOpts<O extends Record<string, any> = {}> = {
  source?: any;
} & O;

export type Changeset<O extends Record<string, any> = {}> = {
  changes: ObserverChangePayload[];
  disposed: t.Type[];
  added: t.Type[];
} & ChangeOpts<O>;

export type ChangesetListener<I extends Record<string, any> = {}> = (
  changeset: Changeset<I>
) => void;

export class Observer<
  T extends t.Type = t.Type,
  O extends Record<string, any> = {}
> extends t.Tree {
  readonly root: T;

  private declare rootDisposer: () => void;
  private valueToTraversalInfo: WeakMap<
    ValuesWithReference,
    ValueTraversalInfo
  >;
  private idToType: Map<string, t.Type>;
  private opts: ObserverOptions;
  private typeToDisposer: WeakMap<t.Type, Disposer>;
  private markedForDisposal: Set<t.Type> = new Set();
  private isDisposing: boolean = false;
  private isMutating: boolean = false;
  private changesetListeners: ChangesetListener[] = [];
  private uncommittedValues: Set<ValuesWithReference> = new Set();
  private changeset: Changeset<O> | null = null;

  constructor(root: T, opts?: Partial<ObserverOptions>) {
    super(opts?.id || getRandomId(), root);

    this.valueToTraversalInfo = new WeakMap();
    this.typeToDisposer = new WeakMap();
    this.idToType = new Map();
    this.root = root;

    /* eslint-disable @typescript-eslint/no-empty-function */
    this.opts = {
      shouldIgnoreObservable: () => false,
      hooks: {
        onAdd: () => {},
        onChange: () => {},
        onDispose: () => {},
      },
      batch: true,
      resolveProp: noop,
      ...(opts || {}),
    };
    /* eslint-enable @typescript-eslint/no-empty-function */

    this.setRoot(root);

    makeObservable(this, {
      root: observable,
    });

    this.uncommittedValues.clear();
  }

  private whileDisposing<C>(cb: () => C) {
    if (this.isDisposing) {
      return cb();
    }

    this.isDisposing = true;
    const returnValue = cb();
    this.isDisposing = false;

    return returnValue;
  }

  private disposeTypes() {
    this.whileDisposing(() => {
      for (const type of this.markedForDisposal) {
        const typeDispoesr = this.typeToDisposer.get(type);

        if (!typeDispoesr) {
          continue;
        }

        typeDispoesr();
      }

      this.markedForDisposal.clear();
    });
  }

  private setRoot(type: T) {
    if (this.rootDisposer) {
      this.rootDisposer();
    }

    const rootDisposer = this.setupType(type);

    invariant(
      rootDisposer !== undefined,
      `Failed to set up observer --- Root type did not return a valid disposer`
    );

    this.rootDisposer = rootDisposer;
  }

  resolveProp(node: t.Type, name: string) {
    return this.opts.resolveProp(node, name);
  }

  getTypeFromId<T extends t.Type = t.Any>(
    id: string,
    expectedType?: t.TypeConstructor<T>
  ) {
    const type = this.idToType.get(id) as T;

    if (expectedType) {
      invariant(type instanceof expectedType, 'Unexpected type');
    }

    return type;
  }

  listenToChangeset(subscriber: ChangesetListener<any>) {
    this.changesetListeners.push(subscriber);

    return () => {
      this.changesetListeners.splice(
        this.changesetListeners.indexOf(subscriber),
        1
      );
    };
  }

  private setupChild(value: any, traversal: ValueTraversalInfo) {
    if (value instanceof t.Type) {
      return this.setupType(value, traversal);
    }

    if (isObservableArray(value)) {
      return this.setupArray(value, traversal);
    }

    if (t.isObjectLiteral(value)) {
      return this.setupMap(value, traversal);
    }

    return noop;
  }

  private setupType(value: t.Type, traversal?: ValueTraversalInfo) {
    this.markedForDisposal.delete(value);

    if (traversal) {
      this.valueToTraversalInfo.set(value, traversal);
    }

    /**
     * Ignore setting up observers if the value is already in the tree
     */
    if (this.idToType.get(value.id) && this.idToType.get(value.id) === value) {
      return noop;
    }

    this.addNodeToTree(value);

    this.uncommittedValues.add(value);

    // Remove any existing registration of the same type
    // Should typically never happen
    this.typeToDisposer.get(value)?.();

    this.handleOnAddType(value);

    this.idToType.set(value.id, value);

    let currId = value.id;

    const schema = t.Schema.get(value.type);

    if (!isObservable(value)) {
      makeObservable(value, {
        ...Object.fromEntries(
          schema.fields
            .filter((field) => {
              if (!this.opts.shouldIgnoreObservable) {
                return true;
              }

              return (
                this.opts.shouldIgnoreObservable(
                  value,
                  field.name,
                  value[field.name]
                ) === false
              );
            })
            .map((field) => [field.name, observable])
        ),
        ...Object.fromEntries(
          Object.keys(schema.annotations).map((name) => [name, computed])
        ),
      });
    }

    const fieldDisposers = new Map();

    for (const field of schema.fields) {
      if (fieldDisposers.get(field.name)) {
        return;
      }

      if (
        this.opts.shouldIgnoreObservable?.(
          value,
          field.name,
          value[field.name]
        ) === true
      ) {
        continue;
      }

      fieldDisposers.set(
        field.name,
        this.setupChild(value[field.name], {
          parentValue: value,
          nearestParentNode: value,
          parentKey: field.name,
        })
      );
    }

    const disposeTypeObserver = observe(value, (e) => {
      // sanity check, remove op will never be possible
      if (e.type === 'remove') {
        return;
      }

      if (e.name === 'id' && e.newValue !== currId) {
        invariant(this.idToType.get(e.newValue), 'Id already exists');

        this.idToType.delete(currId);
        currId = e.newValue;
        this.idToType.set(currId, value);
      }

      this.handleOnChange(value, e);

      if (fieldDisposers.get(e.name)) {
        fieldDisposers.get(e.name)();
      }

      if (
        this.opts.shouldIgnoreObservable?.(
          value,
          String(e.name),
          value[e.name]
        ) === true
      ) {
        return;
      }

      fieldDisposers.set(
        e.name,
        this.setupChild(value[e.name], {
          parentValue: value,
          nearestParentNode: value,
          parentKey: String(e.name),
        })
      );

      return e;
    });

    if (!this.typeToDisposer.get(value)) {
      this.typeToDisposer.set(value, () => {
        if (this.idToType.get(value.id) === value) {
          this.idToType.delete(value.id);
        }

        this.handleOnDisposeType(value);
        disposeTypeObserver();
        fieldDisposers.forEach((disposeChildField) => disposeChildField?.());

        this.typeToDisposer.delete(value);
        this.markedForDisposal.delete(value);
      });
    }

    return () => {
      const typeDisposer = this.typeToDisposer.get(value);

      if (!typeDisposer) {
        return;
      }

      if (this.isDisposing) {
        typeDisposer();

        return;
      }

      this.markedForDisposal.add(value);
    };
  }

  private setupArray(
    value: IObservableArray<any>,
    traversal: ValueTraversalInfo
  ) {
    this.valueToTraversalInfo.set(value, traversal);
    this.uncommittedValues.add(value);

    const disposers = new Map();

    // Stores the number of count for each unique array item
    const uniqueArrayItemCount = new Map();

    const setupArrayItem = (item: any, index: number) => {
      // We need to keep track of the number of visits
      // This can happen when you're moving items around, where a deleting an array item doesn't mean it was removed
      uniqueArrayItemCount.set(item, (uniqueArrayItemCount.get(item) || 0) + 1);

      if (disposers.get(item)) {
        return;
      }

      disposers.set(
        item,
        this.setupChild(item, {
          parentValue: value,
          nearestParentNode: traversal.nearestParentNode,
          parentKey: index,
        })
      );
    };

    const removeArrayItem = (item: any) => {
      const count = uniqueArrayItemCount.get(item);

      if (count !== 1) {
        uniqueArrayItemCount.set(item, count - 1);
        return;
      }

      uniqueArrayItemCount.delete(item);

      if (!disposers.get(item)) {
        return;
      }

      disposers.get(item)();
      disposers.delete(item);
    };

    value.forEach((item, i) => {
      setupArrayItem(item, i);
    });

    const disposeArrayObserver = observe(value, (e) => {
      if (e.type === 'update') {
        removeArrayItem(e.oldValue);
        setupArrayItem(e.newValue, e.index);
        this.handleOnChange(value, e);
        return null;
      }

      for (let i = 0; i < e.added.length; i++) {
        setupArrayItem(e.added[i], e.index + i);
      }

      if (e.added.length > 0) {
        for (let i = e.index + e.added.length; i < value.length; i++) {
          const existingParentForValue = this.valueToTraversalInfo.get(
            value[i]
          );

          invariant(
            existingParentForValue,
            'Parent map not found for array element'
          );

          this.valueToTraversalInfo.set(value[i], {
            ...existingParentForValue,
            parentKey: i,
          });
        }
      }

      for (let i = 0; i < e.removed.length; i++) {
        removeArrayItem(e.removed[i]);
      }

      if (e.removedCount > 0) {
        // Update the "key" index for existing child values
        for (let i = e.index; i < value.length; i++) {
          const existingParentForValue = this.valueToTraversalInfo.get(
            value[i]
          );
          invariant(
            existingParentForValue,
            'Parent map not found for array element'
          );

          this.valueToTraversalInfo.set(value[i], {
            ...existingParentForValue,
            parentKey: i,
          });
        }
      }

      this.handleOnChange(value, e);

      return e;
    });

    return () => {
      disposeArrayObserver();
      disposers.forEach((disposeArrayItem) => disposeArrayItem?.());
    };
  }

  private setupMap(value: IObservable, parent: ValueTraversalInfo) {
    this.valueToTraversalInfo.set(value, parent);
    this.uncommittedValues.add(value);

    const childFieldObservers = new Map();

    const setupChildMapValue = (childValue: any, childKey: string) => {
      if (childFieldObservers.get(childKey)) {
        return;
      }

      childFieldObservers.set(
        childKey,
        this.setupChild(childValue, {
          parentValue: value,
          nearestParentNode: parent.nearestParentNode,
          parentKey: childKey,
        })
      );
    };

    for (const childKey of Object.keys(value)) {
      const childValue = value[childKey];
      setupChildMapValue(childValue, childKey);
    }

    const disposeObjObserver = observe(value, (n) => {
      if (n.type === 'remove' || n.type === 'update') {
        if (childFieldObservers.get(n.name)) {
          childFieldObservers.get(n.name)();
          childFieldObservers.delete(n.name);
        }
      }

      if (n.type != 'remove') {
        setupChildMapValue(n.newValue, String(n.name));
      }

      this.handleOnChange(value, n);
    });

    return () => {
      disposeObjObserver();
      childFieldObservers.forEach((disposeChildProperty) =>
        disposeChildProperty?.()
      );
    };
  }

  private updateChangeset(cb: (changeset: Changeset<O>) => void) {
    if (!this.isMutating) {
      return;
    }

    const changeset = this.changeset;

    // should never happen
    invariant(changeset, `Changeset not found in mutation`);

    cb(changeset);
  }

  private handleOnAddType(type: t.Type) {
    if (this.opts.hooks?.onAdd) {
      this.opts.hooks.onAdd({
        type,
      });
    }

    this.updateChangeset((changeset) => {
      changeset.added.push(type);
    });
  }

  private handleOnDisposeType(type: t.Type) {
    if (this.opts.hooks?.onDispose) {
      this.opts.hooks.onDispose({
        type,
      });
    }

    this.updateChangeset((changeset) => {
      changeset.disposed.push(type);
    });
  }

  private handleOnChange(
    value: ValuesWithReference,
    payload: MobxChangePayload
  ) {
    invariant(
      this.isMutating,
      'Mutation not allowed outside of the .change() method'
    );

    /**
     * Only notify if parent has already been committed
     *
     * This is to prevent situations where a parent and its children are added in the same mutation.
     * For example:
     *
     * observer.change(() => {
     *   // parent element added here
     *   root.someKey = [];
     *
     *   // its child values are also added within the same mutation
     *   // in which case, we can ignore notifying the listeners of this second mutation
     *   root.someKey.push({})
     * })
     */
    if (this.isParentValueUncommitted(value)) {
      return;
    }

    const parentWithPath = this.getValueLocation(value);

    const change = {
      ...payload,
      ...parentWithPath,
    } as ObserverChangePayload;

    if (this.opts.hooks?.onChange) {
      this.opts.hooks.onChange(change);
    }

    this.updateChangeset((changeset) => {
      changeset.changes.push(change);
    });

    return change;
  }

  private isParentValueUncommitted(value: ValuesWithReference) {
    const traversalInfo = this.getValueTraversalInfo(value);

    if (
      traversalInfo &&
      this.uncommittedValues.has(traversalInfo.parentValue)
    ) {
      return true;
    }

    return false;
  }

  private notifyChangesetListeners() {
    const changeset = this.changeset;

    invariant(changeset, `Changeset not found. Nothing to notify`);

    this.changesetListeners.map((subscriber) => subscriber(changeset));
  }

  private getValueTraversalInfo(value: ValuesWithReference) {
    const traversalInfo = this.valueToTraversalInfo.get(value);

    return traversalInfo ?? null;
  }

  /**
   * Get the nearest parent Type node (and any additional path to traverse) in order to reach a given value
   * For example:
   * {
   *   type: "A",
   *   children: [
   *      {
   *        type: "B"
   *      }
   *   ]
   *
   *   The location of "B" is {
   *     parent: "A",
   *     path: ["children", 0]
   *   }
   * }
   */
  private getValueLocation(value: ValuesWithReference): Location {
    // To keep things simple, if the value is the root node itself,
    // We just return an empty path with its parent node being itself
    if (value === this.root) {
      return {
        parent: this.root,
        path: [],
      };
    }

    const immediateParent = this.valueToTraversalInfo.get(value);

    invariant(immediateParent, `Parent map not found`);

    const owner = immediateParent.nearestParentNode;

    let curr = immediateParent.parentValue;

    const reversedPath: Array<string | number> = [immediateParent.parentKey];

    while (curr && curr !== owner) {
      const parent = this.valueToTraversalInfo.get(curr);

      invariant(parent);

      reversedPath.push(parent.parentKey);
      curr = parent.parentValue;
    }

    return {
      parent: owner,
      path: reversedPath.reverse(),
    };
  }

  getNodeLocation(node: t.Type) {
    invariant(node instanceof t.Type);

    return this.getValueLocation(node);
  }

  getParentNode<T extends t.Type = t.Any>(
    node: t.Type,
    expectedParentType?: t.TypeConstructor<T>
  ) {
    if (node === this.root) {
      return null;
    }

    const parent = this.valueToTraversalInfo.get(node);

    invariant(parent, `Parent map not found`);

    const parentNode = parent.nearestParentNode;

    if (expectedParentType) {
      invariant(
        parentNode instanceof expectedParentType,
        'Unexpected parent type'
      );
    }

    return parentNode as T;
  }

  getNodePath(node: t.Type) {
    const parentWithPath = this.getNodeLocation(node);

    if (!parentWithPath) {
      return null;
    }

    return parentWithPath.path;
  }

  getNodePathStr(node: t.Type) {
    const parentWithPath = this.getNodeLocation(node);

    if (!parentWithPath.parent) {
      return '';
    }

    return `${parentWithPath.parent.id}.${parentWithPath.path.join('.')}`;
  }

  change<C>(mutation: () => C, opts?: ChangeOpts<O>) {
    const _change = () => {
      if (this.isMutating) {
        return runInAction(() => {
          return mutation();
        });
      }

      return runInAction(() => {
        this.changeset = {
          ...((opts ?? {}) as O),
          added: [],
          disposed: [],
          changes: [],
          source: opts?.source,
        };

        this.isMutating = true;

        const returnValue = mutation();
        this.disposeTypes();
        this.uncommittedValues.clear();
        this.notifyChangesetListeners();

        this.isMutating = false;

        return returnValue;
      });
    };

    if (this.opts.batch) {
      return _change();
    }

    return this.whileDisposing(() => _change());
  }

  dispose() {
    this.whileDisposing(() => {
      this.rootDisposer();
    });

    this.valueToTraversalInfo = new WeakMap();
    this.idToType = new Map();
    this.typeToDisposer = new Map();
    this.markedForDisposal.clear();
  }
}
