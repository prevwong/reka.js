import * as t from '@composite/types';

import { ExtensionDefinition, ExtensionStateDefinition } from './definition';

import { StateSubscriberOpts } from '../interfaces';
import { Composite } from '../state';

export class Extension<S extends ExtensionStateDefinition | any = undefined> {
  composite: Composite;
  definition: ExtensionDefinition<S>;

  constructor(composite: Composite, definition: ExtensionDefinition<S>) {
    this.composite = composite;
    this.definition = definition;
  }

  init() {
    const existingState = this.composite.state.extensions[this.definition.key];

    if (this.definition.state && !existingState) {
      this.composite.state.extensions[this.definition.key] = t.extensionState({
        value: this.definition.state || null,
      });
    }

    return this.definition.init(this);
  }

  dispose() {
    return this.definition.dispose(this);
  }

  get state() {
    return this.composite.state.extensions[this.definition.key].value as S;
  }

  subscribe<C extends Record<string, any>>(
    collector: (state: S) => C,
    subscriber: (collected: C, prevCollected: C) => void,
    opts?: StateSubscriberOpts
  ) {
    return this.composite.subscribe(
      () => collector(this.state),
      subscriber,
      opts
    );
  }
}
