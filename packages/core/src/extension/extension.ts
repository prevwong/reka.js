import * as t from '@rekajs/types';

import { ExtensionDefinition, ExtensionStateDefinition } from './definition';

import { StateSubscriberOpts } from '../interfaces';
import { Reka } from '../state';

export class Extension<S extends ExtensionStateDefinition | any = undefined> {
  reka: Reka;
  definition: ExtensionDefinition<S>;

  constructor(reka: Reka, definition: ExtensionDefinition<S>) {
    this.reka = reka;
    this.definition = definition;
  }

  init() {
    const existingState = this.reka.state.extensions[this.definition.key];

    if (this.definition.state && !existingState) {
      this.reka.state.extensions[this.definition.key] = t.extensionState({
        value: this.definition.state || null,
      });
    }

    return this.definition.init(this);
  }

  dispose() {
    return this.definition.dispose(this);
  }

  get state() {
    return this.reka.state.extensions[this.definition.key].value as S;
  }

  subscribe<C extends Record<string, any>>(
    collector: (state: S) => C,
    subscriber: (collected: C, prevCollected: C) => void,
    opts?: StateSubscriberOpts
  ) {
    return this.reka.subscribe(() => collector(this.state), subscriber, opts);
  }
}
