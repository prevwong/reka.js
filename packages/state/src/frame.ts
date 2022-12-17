import { makeObservable, observable, action } from 'mobx';

import { State } from './state';
import { ViewEvaluator } from './evaluator';

type FrameComponentConfig = {
  name: string;
  props?: Record<string, any>;
};

export type FrameOpts = {
  id?: string;
  component: FrameComponentConfig;
};

export class Frame {
  id?: string;
  sync: boolean;
  component: FrameComponentConfig;

  private evaluator: ViewEvaluator;

  constructor(opts: FrameOpts, state: State) {
    this.id = opts.id;
    this.component = opts.component;

    this.evaluator = new ViewEvaluator(
      this,
      this.component.name,
      this.component.props || {},
      state
    );

    this.sync = true;

    makeObservable(this, {
      sync: observable,
      enableSync: action,
      disableSync: action,
    });
  }

  get root() {
    return this.evaluator.root;
  }

  enableSync() {
    this.sync = true;
    this.render();
  }

  disableSync() {
    this.sync = false;
  }

  render() {
    if (!this.sync) {
      return;
    }

    return this.evaluator.computeTree();
  }

  setProps(props: Record<string, any>) {
    this.evaluator.setProps(props);
  }
}
