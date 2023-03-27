import * as t from '@rekajs/types';

import { ExtensionDefinition, ExtensionStateFromDefinition } from './definition';

import { StateSubscriberOpts } from '../interfaces';
import { Reka } from '../reka';


export class Extension<D extends ExtensionDefinition = any> {
  reka: Reka;
  definition: D;

  constructor(reka: Reka, definition: D) {
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

  get state(): ExtensionStateFromDefinition<D> {
    return this.reka.state.extensions[this.definition.key].value;
  }

  subscribe<C extends Record<string, any>>(
    collector: (state: D['state']) => C,
    subscriber: (collected: C, prevCollected: C) => void,
    opts?: StateSubscriberOpts
  ) {
    return this.reka.subscribe(() => collector(this.state), subscriber, opts);
  }
}
