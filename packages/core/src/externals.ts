import * as t from '@rekajs/types';
import { invariant } from '@rekajs/utils';
import { action, makeObservable, observable } from 'mobx';

import {
  StateExternalFunctions,
  StateExternalStates,
  RekaExternalsFactory,
} from './interfaces';
import { Reka } from './reka';

type ExternalSource = 'states' | 'functions' | 'components';

export class Externals {
  states: StateExternalStates;
  functions: StateExternalFunctions;
  components: Record<string, t.Component>;

  private lookup: Record<string, ExternalSource> = {};

  constructor(
    private readonly reka: Reka,
    opts?: Partial<RekaExternalsFactory>
  ) {
    this.states = opts?.states || {};
    this.functions = opts?.functions?.(this.reka) || {};
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

    for (const fn in this.functions) {
      this.insertLookup(fn, 'functions');
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
    return this.functions[name];
  }

  get(name: string) {
    const source = this.lookup[name];

    if (source === 'states') {
      return this.states[name];
    }

    if (source === 'functions') {
      return this.functions[name];
    }

    if (source === 'components') {
      return this.components[name];
    }

    return undefined;
  }
}
