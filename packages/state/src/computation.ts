import { computed, IComputedValue } from 'mobx';
import { IDisposer, keepAlive } from 'mobx-utils';

type ComputationOpts = {
  keepAlive?: boolean;
};

export class Computation<T> {
  private computation: IComputedValue<T>;
  private disposer?: IDisposer;

  constructor(computation: () => T, opts?: ComputationOpts) {
    this.computation = computed(computation);

    if (opts?.keepAlive) {
      this.disposer = keepAlive(this.computation);
    }
  }

  get() {
    return this.computation.get();
  }

  dispose() {
    if (!this.disposer) {
      return;
    }

    this.disposer();
  }
}
