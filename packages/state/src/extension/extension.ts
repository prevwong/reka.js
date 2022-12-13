import * as t from '@composite/types';

import { State, StateSubscriberOpts } from '../state';
import { ExtensionDefinition, ExtensionStateDefinition } from './definition';

export class Extension<S extends ExtensionStateDefinition | any = undefined> {
  private _state: t.ExtensionState;

  constructor(
    readonly composite: State,
    readonly definition: ExtensionDefinition<S>
  ) {
    const existingState = composite.data.extensions[definition.key];

    if (existingState) {
      existingState['_d'] = true;
    }

    this._state = existingState
      ? t.extensionState(existingState)
      : t.extensionState({
          value: definition.state || null,
        });

    if (definition.state) {
      this.composite.data.extensions[definition.key] = this._state;
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
      (query) => collector(query.getExtension(this.definition).state),
      subscriber,
      opts
    );
  }
}
