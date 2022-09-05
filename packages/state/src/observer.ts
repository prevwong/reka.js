import { Schema, Type } from '@composite/types';
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
import invariant from 'tiny-invariant';
import { isObjectLiteral } from './utils';

type Parent = {
  value: any;
  key: string | number;
};

type Path = {
  parent: Type | Array<any> | Record<string, any>;
  key: string | number;
};

type OnAddPayload = {
  type: Type;
  path: Path[];
};

type OnDiposePayload = {
  type: Type;
  path: Path[];
};

type OnChangePayload = (IObjectDidChange | IArraySplice) & {
  path: Path[];
};

export type ObserverHooks = {
  onAdd: (payload: OnAddPayload) => void;
  onChange: (payload: OnChangePayload) => void;
  onDispose: (payload: OnDiposePayload) => void;
};

export type ObserverOptions = {
  hooks?: Partial<ObserverHooks>;
};

export class Observer<T extends Type = Type> {
  root: T;
  valueToParentMap: WeakMap<any, any>;
  subscribers: any[] = [];
  idToType: Map<string, Type>;
  opts: ObserverOptions;

  isDisposed: boolean = false;

  private declare rootDisposer: () => void;

  constructor(type: T, opts?: Partial<ObserverOptions>) {
    this.valueToParentMap = new WeakMap();
    this.idToType = new Map();
    this.root = type;
    this.opts = opts ?? {};

    this.setupRootType(type);

    makeObservable(this, {
      root: observable,
    });
  }

  private setupRootType(type: T) {
    const rootDisposer = this.setupType(type);

    invariant(
      rootDisposer !== undefined,
      `Failed to set up observer --- Root type did not return a valid disposer`
    );

    this.rootDisposer = rootDisposer;
  }

  dispose() {
    if (this.isDisposed) {
      return;
    }

    if (this.rootDisposer) {
      this.rootDisposer();
    }

    this.isDisposed = true;

    this.valueToParentMap = new WeakMap();
    this.idToType = new Map();
  }

  replace(type: T) {
    this.dispose();

    runInAction(() => {
      this.root = type;
    });

    this.setupRootType(type);

    this.notify({
      type: 'replace',
    });
  }

  subscribe(subscriber: any) {
    this.subscribers.push(subscriber);

    return () => {
      this.subscribers.splice(this.subscribers.indexOf(subscriber), 1);
    };
  }

  setupChild(value: any, parent: Parent) {
    try {
      if (value instanceof Type) {
        return this.setupType(value, parent);
      }

      if (isObservableArray(value)) {
        return this.setupArray(value, parent);
      }

      if (isObjectLiteral(value)) {
        return this.setupMap(value, parent);
      }

      return () => {};
    } catch (err) {
      console.warn(
        `Cannot set value. Validation failed`,
        err,
        value,
        isObjectLiteral(value),
        parent
      );
    }
  }

  setupType(value: Type, parent?: Parent) {
    if (parent) {
      this.valueToParentMap.set(value, parent);

      // if (validator && validator.isRef) {
      //   return;
      // }
    }

    if (!this.idToType.get(value.id) && this.opts.hooks?.onAdd) {
      this.opts.hooks.onAdd({
        type: value,
        path: this.getPath(value),
      });
    }

    this.idToType.set(value.id, value);

    let currId = value.id;

    const schema = Schema.get(value.type);

    if (!isObservable(value)) {
      makeObservable(
        value,
        Object.fromEntries(
          schema.fields.map((field) => [field.name, observable])
        )
      );
    }

    const fieldDisposers = new Map();

    for (const field of schema.fields) {
      if (fieldDisposers.get(field.name)) {
        return;
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

    return () => {
      if (this.opts.hooks?.onDispose) {
        this.opts.hooks.onDispose({
          type: value,
          path: this.getPath(value),
        });
      }

      disposeTypeObserver();
      fieldDisposers.forEach((disposeChildField) => disposeChildField?.());
    };
  }

  setupArray(value: IObservableArray<any>, parent: Parent) {
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
          this.valueToParentMap.set(value[i], {
            ...this.valueToParentMap.get(value[i]),
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
          this.valueToParentMap.set(value[i], {
            ...this.valueToParentMap.get(value[i]),
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

  setupMap(value: IObservable, parent: Parent) {
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

  handleOnChange(value: any, payload: any) {
    const change = {
      ...payload,
      path: this.getPath(value),
    };

    if (this.opts.hooks?.onChange) {
      this.opts.hooks.onChange(change);
    }

    this.notify(change);

    return change;
  }

  private notify(change: any) {
    this.subscribers.forEach((subscriber) => subscriber(change));
  }

  getPath(value) {
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

  getParent(type: Type) {
    return this.valueToParentMap.get(type);
  }
}
