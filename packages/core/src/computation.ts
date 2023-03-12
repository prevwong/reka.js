import {
  action,
  computed,
  IComputedValue,
  IObservableValue,
  makeObservable,
  observable,
} from 'mobx';

type DisposableComputationOpts = {
  name?: string;
  keepAlive?: boolean;
};

export class DisposableComputation<V> {
  private _disposed: IObservableValue<boolean>;
  private declare _computation: IComputedValue<V | void>;
  private opts: DisposableComputationOpts;

  constructor(
    private readonly compute: () => V,
    opts?: DisposableComputationOpts
  ) {
    this._disposed = observable.box(false);

    this.opts = {
      keepAlive: false,
      ...(opts ?? {}),
    };

    makeObservable(this, {
      dispose: action,
    });

    this._computation = computed(
      () => {
        if (this.opts.keepAlive && this.disposed) {
          return;
        }

        return this.compute();
      },
      {
        keepAlive: this.opts.keepAlive,
        name: this.opts.name ? `Computation<${this.opts.name}>` : undefined,
      }
    );
  }

  private get disposed() {
    return this._disposed.get();
  }

  get() {
    if (this.opts.keepAlive && this.disposed) {
      return this.compute();
    }

    return this._computation.get() as V;
  }

  dispose() {
    if (!this.opts.keepAlive) {
      return;
    }

    this._disposed.set(true);
    this._computation.get();
  }
}
