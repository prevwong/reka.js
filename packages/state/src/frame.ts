import { makeObservable, observable, action } from 'mobx';

import { State } from './state';
import { ViewTree } from './view';

type FrameComponentConfig = {
  name: string;
  props?: Record<string, any>;
};
export type FrameOpts = {
  component: FrameComponentConfig;
  id?: string;
};

export class Frame {
  id?: string;
  tree: ViewTree;
  sync: boolean;

  component: FrameComponentConfig;

  constructor(opts: FrameOpts, state: State) {
    this.id = opts.id;
    this.component = opts.component;

    this.tree = new ViewTree(
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
    return this.tree.root;
  }

  enableSync() {
    this.sync = true;
    this.render();
  }

  disableSync() {
    this.sync = false;
  }

  async render() {
    if (!this.sync) {
      return;
    }

    return this.tree.computeTree();
  }

  hardRerender() {
    this.tree.dispose();
  }
}
