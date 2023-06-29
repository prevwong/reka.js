import * as t from '@rekajs/types';

import {
  ExtensionDefinition,
  ExtensionStateFromDefinition,
} from './definition';

import { StateSubscriberOpts } from '../interfaces';
import { Reka } from '../reka';
import { ExtensionVolatileStateKey } from '../symbols';

export class Extension<D extends ExtensionDefinition = any> {
  reka: Reka;
  definition: D;

  declare state: ExtensionStateFromDefinition<D>;

  constructor(reka: Reka, definition: D) {
    this.reka = reka;
    this.definition = definition;
  }

  init() {
    const existingState = this.reka.state.extensions[this.definition.key];

    const {
      volatile: volatileStateDefinition,
      ...serialisableStateDefinition
    } = this.definition.state || {};

    if (this.definition.state && !existingState) {
      this.reka.state.extensions[this.definition.key] = t.extensionState({
        value:
          Object.keys(serialisableStateDefinition).length > 0
            ? serialisableStateDefinition
            : null,
      });
    }

    this.reka.volatile[ExtensionVolatileStateKey][this.definition.key] =
      volatileStateDefinition ?? {};

    const serialisableState =
      this.reka.state.extensions[this.definition.key]?.value ?? {};

    const volatileState =
      this.reka.volatile[ExtensionVolatileStateKey][this.definition.key] || {};

    this.state = new Proxy(serialisableState, {
      get: (_, prop) => {
        if (prop === 'volatile') {
          return volatileState;
        }

        return serialisableState[prop as any];
      },
    });

    return this.definition.init(this);
  }

  dispose() {
    return this.definition.dispose(this);
  }

  subscribe<C extends Record<string, any>>(
    collector: (state: D['state']) => C,
    subscriber: (collected: C, prevCollected: C | undefined) => void,
    opts?: StateSubscriberOpts
  ) {
    return this.reka.subscribe(() => collector(this.state), subscriber, opts);
  }
}
