import * as t from '@rekajs/types';
import { invariant } from '@rekajs/utils';
import { action, makeObservable, observable } from 'mobx';

import {
  StateExternalGlobals,
  StateExternalLocals,
  StateExternalsFactory,
} from './interfaces';
import { Reka } from './reka';

type ExternalSource = 'states' | 'globals' | 'components';

export class Externals {
  states: StateExternalLocals;
  globals: StateExternalGlobals;
  components: Record<string, t.Component>;

  private lookup: Record<string, ExternalSource> = {};

  constructor(
    private readonly reka: Reka,
    opts?: Partial<StateExternalsFactory>
  ) {
    this.states = opts?.states || {};
    this.globals = opts?.globals?.(this.reka) || {};
    this.components =
      opts?.components?.reduce(
        (accum, component) => ({
          ...accum,
          [component.name]: component,
        }),
        {}
      ) || [];

    this.createNamedLookup();

    makeObservable(this, {
      states: observable,
      updateState: action,
    });
  }

  private insertLookup(name: string, source: ExternalSource) {
    invariant(
      !this.lookup[name],
      `Conflicting external "${name}". An external of the same name "${this.lookup[name]}" has already been declared. Please use a different name.`
    );

    this.lookup[name] = source;
  }

  private createNamedLookup() {
    for (const state in this.states) {
      this.insertLookup(state, 'states');
    }

    for (const global in this.globals) {
      this.insertLookup(global, 'globals');
    }

    for (const component in this.components) {
      this.insertLookup(component, 'components');
    }
  }

  updateState(key: string, value: any) {
    this.states[key] = value;
  }

  getState(key: string) {
    return this.states[key];
  }

  getComponent(name: string) {
    return this.components[name];
  }

  getGlobal(name: string) {
    return this.globals[name];
  }

  get(name: string) {
    const source = this.lookup[name];

    if (source === 'states') {
      return this.states[name];
    }

    if (source === 'globals') {
      return this.globals[name];
    }

    if (source === 'components') {
      return this.components[name];
    }

    return undefined;
  }
}
