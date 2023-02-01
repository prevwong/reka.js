import * as t from '@rekajs/types';
import { TypeConstructor } from '@rekajs/types';
import { invariant } from '@rekajs/utils';
import {
  IArraySplice,
  IObjectDidChange,
  IObservable,
  IObservableArray,
  isObservable,
  isObservableArray,
  makeObservable,
  observable,
  observe,
  runInAction,
} from 'mobx';

import { isObjectLiteral } from './utils';

type ValuesWithReference = Array<any> | Record<string, any> | t.Type;

type Parent = {
  value: ValuesWithReference;
  key: string | number;
};

type Path = {
  parent: t.Type | Array<any> | Record<string, any>;
  key: string | number;
};

type OnAddPayload = {
  type: t.Type;
};

type OnDiposePayload = {
  type: t.Type;
};

type OnChangePayload = Omit<IObjectDidChange | IArraySplice, 'path'> & {
  path: Path[];
};

type ValueDisposer = () => void;

export type ObserverHooks = {
  onAdd: (payload: OnAddPayload) => void;
  onChange: (payload: OnChangePayload) => void;
  onDispose: (payload: OnDiposePayload) => void;
};

export type ObserverOptions = {
  batch: boolean;
  shouldIgnoreObservable: (type: t.Type, key: string) => boolean;
  hooks: Partial<ObserverHooks>;
};

export type ChangeOpts = {
  batch: boolean;
};

type ChangeListenerOnAddPayload = { event: 'add' } & OnAddPayload;
type ChangeListenerOnDisposePaylaod = { event: 'dispose' } & OnDiposePayload;
type ChangeListenerOnChangePayload = { event: 'change' } & OnChangePayload;

type ChangeListenerPayload =
  | ChangeListenerOnAddPayload
  | ChangeListenerOnDisposePaylaod
  | ChangeListenerOnChangePayload;

export type ChangeListenerSubscriber = (payload: ChangeListenerPayload) => void;

export class Observer<T extends t.Type = t.Type> {
  root: T;

  private declare rootDisposer: () => void;

  private valueToParentMap: WeakMap<ValuesWithReference, Parent>;
  private changeListenerSubscribers: ChangeListenerSubscriber[] = [];
  private idToType: Map<string, t.Type>;
  private opts: ObserverOptions;
  private typeToDisposer: WeakMap<t.Type, ValueDisposer>;
  private markedForDisposal: Set<t.Type> = new Set();
  private isDisposing: boolean = false;
  private isMutation: boolean = false;

  private uncomittedValues: Set<Record<string, any> | Array<any> | t.Type> =
    new Set();

  constructor(type: T, opts?: Partial<ObserverOptions>) {
    this.valueToParentMap = new WeakMap();
    this.typeToDisposer = new WeakMap();
    this.idToType = new Map();
    this.root = type;

    /* eslint-disable @typescript-eslint/no-empty-function */
    this.opts = {
      shouldIgnoreObservable: () => false,
      hooks: {
        onAdd: () => {},
        onChange: () => {},
        onDispose: () => {},
      },
      batch: true,
      ...(opts || {}),
    };
    /* eslint-enable @typescript-eslint/no-empty-function */

    this.setRoot(type);

    makeObservable(this, {
      root: observable,
    });
  }

  private whileDisposing(cb: () => void) {
    if (this.isDisposing) {
      cb();
      return;
    }

    this.isDisposing = true;
    cb();
    this.isDisposing = false;
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

  getTypeFromId<T extends t.Type = t.Any>(
    id: string,
    expectedType?: TypeConstructor<T>
  ) {
    const type = this.idToType.get(id) as T;

    if (expectedType) {
      invariant(type instanceof expectedType, 'Unexpected type');
    }

    return type;
  }

  listenToChanges(changeListenerSubscriber: ChangeListenerSubscriber) {
    this.changeListenerSubscribers.push(changeListenerSubscriber);

    return () => {
      this.changeListenerSubscribers.splice(
        this.changeListenerSubscribers.indexOf(changeListenerSubscriber),
        1
      );
    };
  }

  private _setupChild(value: any, parent: Parent) {
    if (value instanceof t.Type) {
      return this.setupType(value, parent);
    }

    if (isObservableArray(value)) {
      return this.setupArray(value, parent);
    }

    if (isObjectLiteral(value)) {
      return this.setupMap(value, parent);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }

  private setupChild(value: any, parent: Parent) {
    if (
      this.isMutation &&
      typeof value !== 'function' &&
      value instanceof Object
    ) {
      this.uncomittedValues.add(value);
    }

    return this._setupChild(value, parent);
  }

  private setupType(value: t.Type, parent?: Parent) {
    if (parent) {
      this.valueToParentMap.set(value, parent);
    }

    this.markedForDisposal.delete(value);

    if (!this.idToType.get(value.id)) {
      this.handleOnAddType(value);
    }

    this.idToType.set(value.id, value);

    let currId = value.id;

    const schema = t.Schema.get(value.type);

    if (!isObservable(value)) {
      makeObservable(
        value,
        Object.fromEntries(
          schema.fields
            .filter((field) => {
              if (!this.opts.shouldIgnoreObservable) {
                return true;
              }

              return (
                this.opts.shouldIgnoreObservable(value, field.name) === false
              );
            })
            .map((field) => [field.name, observable])
        )
      );
    }

    const fieldDisposers = new Map();

    for (const field of schema.fields) {
      if (fieldDisposers.get(field.name)) {
        return;
      }

      if (this.opts.shouldIgnoreObservable?.(value, field.name) === true) {
        continue;
      }

      fieldDisposers.set(
        field.name,
        this.setupChild(value[field.name], {
          value,
          key: field.name,
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

      fieldDisposers.set(
        e.name,
        this.setupChild(e.newValue, {
          value,
          key: e.name as string,
        })
      );

      return e;
    });

    if (!this.typeToDisposer.get(value)) {
      this.typeToDisposer.set(value, () => {
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

  private setupArray(value: IObservableArray<any>, parent: Parent) {
    this.valueToParentMap.set(value, parent);

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
          value,
          key: index,
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
          const existingParentForValue = this.valueToParentMap.get(value[i]);
          invariant(
            existingParentForValue,
            'Parent map not found for array element'
          );

          this.valueToParentMap.set(value[i], {
            ...existingParentForValue,
            key: i,
          });
        }
      }

      for (let i = 0; i < e.removed.length; i++) {
        removeArrayItem(e.removed[i]);
      }

      if (e.removedCount > 0) {
        // Update the "key" index for existing child values
        for (let i = e.index; i < value.length; i++) {
          const existingParentForValue = this.valueToParentMap.get(value[i]);
          invariant(
            existingParentForValue,
            'Parent map not found for array element'
          );

          this.valueToParentMap.set(value[i], {
            ...existingParentForValue,
            key: i,
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

  private setupMap(value: IObservable, parent: Parent) {
    this.valueToParentMap.set(value, parent);
    const childFieldObservers = new Map();

    for (const childKey of Object.keys(value)) {
      const childValue = value[childKey];
      if (childFieldObservers.get(childKey)) {
        continue;
      }

      childFieldObservers.set(
        childKey,
        this.setupChild(childValue, {
          value,
          key: childKey,
        })
      );
    }

    const disposeObjObserver = observe(value, (n) => {
      if (n.type === 'remove' || n.type === 'update') {
        if (childFieldObservers.get(n.name)) {
          childFieldObservers.get(n.name)();
          childFieldObservers.delete(n.name);
        }
      }

      if (n.type != 'remove') {
        if (!childFieldObservers.get(n.name)) {
          childFieldObservers.set(
            n.name,
            this.setupChild(n.newValue, {
              value,
              key: n.name as string,
            })
          );
        }
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

  private handleOnAddType(type: t.Type) {
    if (this.opts.hooks?.onAdd) {
      this.opts.hooks.onAdd({
        type,
      });
    }

    this.notify({
      event: 'add',
      type,
    });
  }

  private handleOnDisposeType(type: t.Type) {
    if (this.opts.hooks?.onDispose) {
      this.opts.hooks.onDispose({
        type,
      });
    }

    this.notify({
      event: 'dispose',
      type,
    });
  }

  private handleOnChange(value: any, payload: Omit<OnChangePayload, 'path'>) {
    const change = {
      ...payload,
      path: this.getPath(value),
    };

    const path =
      change.path.length > 0 ? change.path[change.path.length - 1] : null;

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
    if (path && this.uncomittedValues.has(path.parent[path.key])) {
      return;
    }

    if (this.opts.hooks?.onChange) {
      this.opts.hooks.onChange(change);
    }

    this.notify({
      event: 'change',
      ...change,
    });

    return change;
  }

  private notify(change: ChangeListenerPayload) {
    if (!this.isMutation) {
      return;
    }

    this.changeListenerSubscribers.forEach((subscriber) => subscriber(change));
  }

  private getPath(value: t.Type | Array<any> | Object) {
    if (value === this.root) {
      return [];
    }

    const map = this.valueToParentMap.get(value);

    invariant(!!map, `Parent-child map not found!`);

    return [
      ...this.getPath(map.value),
      {
        parent: map.value,
        key: map.key,
      },
    ];
  }

  getParentMap(type: t.Type) {
    return this.valueToParentMap.get(type);
  }

  getParent<T extends t.Type = t.Any>(
    node: t.Type,
    expectedParentType?: t.TypeConstructor<T>
  ) {
    if (node === this.root) {
      return null;
    }

    const path: Parent[] = [];

    let parentMap;
    let current = node;

    do {
      parentMap = this.valueToParentMap.get(current);
      invariant(!!parentMap, 'Parent-child map not found');
      path.unshift(parentMap);
      current = parentMap.value;
    } while (!(parentMap.value instanceof t.Type));

    const parent = path.shift();

    invariant(parent, 'Parent map not found');
    invariant(parent.value instanceof t.Type, 'Parent node not found');

    if (expectedParentType) {
      invariant(
        parent.value instanceof expectedParentType,
        'Unexpected parent type'
      );
    }

    return {
      node: parent.value as T,
      key: parent.key,
      path,
    };
  }

  change(mutation: () => void) {
    const _change = () => {
      if (this.isMutation) {
        mutation();
        return;
      }

      this.isMutation = true;

      runInAction(() => {
        mutation();
      });

      this.isMutation = false;

      this.disposeTypes();
      this.uncomittedValues.clear();
    };

    if (this.opts.batch) {
      _change();
      return;
    }

    this.whileDisposing(() => {
      _change();
    });
  }

  dispose() {
    this.whileDisposing(() => {
      this.rootDisposer();
    });

    this.valueToParentMap = new WeakMap();
    this.idToType = new Map();
    this.typeToDisposer = new Map();
    this.markedForDisposal.clear();
  }
}
