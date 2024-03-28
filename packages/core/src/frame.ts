import * as t from '@rekajs/types';
import { getRandomId } from '@rekajs/utils';
import { makeObservable, observable, action } from 'mobx';

import { Evaluator } from './evaluator';
import { Reka } from './reka';
import { defer } from './utils';

type FrameComponentConfig = {
  name: string;
  external?: boolean;
  props?: Record<string, t.Expression>;
};

export type FrameOpts = {
  id?: string;
  component: FrameComponentConfig;
  syncImmediately?: boolean;
  evaluateImmediately?: boolean;
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

  private evaluator: Evaluator;

  constructor(readonly opts: FrameOpts, readonly reka: Reka) {
    this.id = opts.id || getRandomId();

    this.evaluator = new Evaluator(
      this,
      this.opts.component.name,
      t.clone(this.opts.component.props || {}),
      reka,
      opts.component.external
    );

    this.sync =
      opts.syncImmediately !== undefined ? opts.syncImmediately : true;

    makeObservable(this, {
      sync: observable,
      enableSync: action,
      disableSync: action,
    });
  }

  get componentName() {
    return this.opts.component.name;
  }

  get component() {
    return this.evaluator.component;
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

  /// Get the parent View of the specified View node
  getParentView<T extends t.View>(
    view: t.View,
    expectedParentType?: t.TypeConstructor<T>
  ) {
    return this.evaluator.getParentView(view, expectedParentType);
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
  compute(evaluateImmediately: boolean = false, cb?: () => void) {
    const evaluate = () => {
      if (!this.sync) {
        return;
      }

      const view = this.evaluator.computeView();

      if (cb) {
        cb();
      }

      return view;
    };

    return evaluateImmediately ? evaluate() : defer(async () => evaluate());
  }

  /// Update the props of the Component associated with the Frame
  setProps(props: Record<string, any>) {
    this.evaluator.setProps(t.clone(props));
  }

  /// Listen for changes and mutations made to the Frame's output View
  get listenToChangeset() {
    return this.evaluator.listenToChangeset.bind(this.evaluator);
  }

  dispose() {
    this.evaluator.dispose();
  }

  getViewsForTpl(template: t.Template) {
    return this.evaluator.getViewsForTpl(template);
  }
}
