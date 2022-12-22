import * as t from '@composite/types';

import { ExtensionDefinition, ExtensionStateDefinition } from './definition';

import { StateSubscriberOpts } from '../interfaces';
import { Composite } from '../state';

export class Extension<S extends ExtensionStateDefinition | any = undefined> {
  private _state: t.ExtensionState;

  constructor(
    readonly composite: Composite,
    readonly definition: ExtensionDefinition<S>
  ) {
    const existingState = composite.state.extensions[definition.key];

    if (existingState) {
      existingState['_d'] = true;
    }

    this._state = existingState
      ? t.extensionState(existingState)
      : t.extensionState({
          value: definition.state || null,
        });

    if (definition.state) {
      this.composite.state.extensions[definition.key] = this._state;
    }
  }

  init() {
    return this.definition.init(this);
  }

  dispose() {
    return this.definition.dispose(this);
  }

  get state() {
    return this._state.value as S;
  }

  subscribe<C extends Record<string, any>>(
    collector: (state: S) => C,
    subscriber: (collected: C, prevCollected: C) => void,
    opts?: StateSubscriberOpts
  ) {
    return this.composite.subscribe(
      (composite) => collector(composite.getExtension(this.definition).state),
      subscriber,
      opts
    );
  }
}
