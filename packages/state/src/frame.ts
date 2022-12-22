import * as t from '@composite/types';
import { makeObservable, observable, action } from 'mobx';

import { ViewEvaluator } from './evaluator';
import { Composite } from './state';

type FrameComponentConfig = {
  name: string;
  props?: Record<string, any>;
};

export type FrameOpts = {
  id?: string;
  component: FrameComponentConfig;
};

/**
  Creates a Frame that computes an output View tree for a Component instance.
  You should not create this instance manually. Instead, use Composite.createFrame(...)
 */
export class Frame {
  /// An optional id to easily identify the Frame instance
  id: string | undefined;

  /// Frame only computes (and recomputes) its View when sync is set to true
  sync: boolean;

  component: FrameComponentConfig;

  private evaluator: ViewEvaluator;

  constructor(opts: FrameOpts, composite: Composite) {
    this.id = opts.id;
    this.component = opts.component;

    this.evaluator = new ViewEvaluator(
      this,
      this.component.name,
      this.component.props || {},
      composite
    );

    this.sync = true;

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
    if (!this.sync) {
      return;
    }

    return this.evaluator.computeTree();
  }

  /// Update the props of the Component associated with the Frame
  setProps(props: Record<string, any>) {
    this.evaluator.setProps(props);
  }
}
