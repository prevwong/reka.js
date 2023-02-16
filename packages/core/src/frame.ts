import * as t from '@rekajs/types';
import { makeObservable, observable, action } from 'mobx';

import { ViewEvaluator } from './evaluator';
import { Reka } from './reka';
import { defer } from './utils';

type FrameComponentConfig = {
  name: string;
  props?: Record<string, any>;
};

export type FrameOpts = {
  id: string;
  component: FrameComponentConfig;
  syncImmediately?: boolean;
};

/**
  Creates a Frame that computes an output View tree for a Component instance.
  You should not create this instance manually. Instead, use Reka.createFrame(...)
 */
export class Frame {
  /// An id to easily identify the Frame instance
  id: string;

  /// Frame only computes (and recomputes) its View when sync is set to true
  sync: boolean;

  component: FrameComponentConfig;

  private evaluator: ViewEvaluator;

  constructor(opts: FrameOpts, readonly reka: Reka) {
    this.id = opts.id;
    this.component = opts.component;

    this.evaluator = new ViewEvaluator(
      this,
      this.component.name,
      this.component.props || {},
      reka
    );

    this.sync =
      opts.syncImmediately !== undefined ? opts.syncImmediately : true;

    makeObservable(this, {
      sync: observable,
      enableSync: action,
      disableSync: action,
    });
  }

  /// Get the output View for the Frame
  get view() {
    return this.evaluator.view;
  }

  /// Get a View node by its id
  getViewFromId<T extends t.View = t.View>(
    id: string,
    expectedType?: t.TypeConstructor<T>
  ) {
    return this.evaluator.getViewFromId(id, expectedType);
  }

  /// Enable synching. Changes made to the State that affects the Frame's component will cause its View to be recomputed
  enableSync() {
    this.sync = true;
    this.compute();
  }

  /// Disable synching. Changes made to the State will not cause View to be recomputed
  disableSync() {
    this.sync = false;
  }

  /// Compute a View tree
  compute() {
    return defer(async () => {
      if (!this.sync) {
        return;
      }

      return this.evaluator.computeTree();
    });
  }

  /// Update the props of the Component associated with the Frame
  setProps(props: Record<string, any>) {
    this.evaluator.setProps(props);
  }
}
