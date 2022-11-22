import * as t from '@composite/types';

import { State, StateSubscriberOpts } from '../state';
import { ExtensionDefinition, ExtensionStateDefinition } from './definition';

export class Extension<S extends ExtensionStateDefinition | any = undefined> {
  private _state: t.ExtensionState;

  constructor(
    readonly composite: State,
    readonly definition: ExtensionDefinition<S>
  ) {
    this._state = t.extensionState({
      value: definition.state || null,
    });

    this.composite.data.extensions[definition.key] = this._state;
  }

  init() {
    return this.definition.init(this);
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
      (query) => collector(query.getExtensionState(this.definition)),
      subscriber,
      opts
    );
  }
}
