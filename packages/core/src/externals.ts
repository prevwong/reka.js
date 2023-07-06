import * as t from '@rekajs/types';
import { invariant } from '@rekajs/utils';
import { runInAction } from 'mobx';

import { RekaExternalsFactory } from './interfaces';
import { Reka } from './reka';
import { ExternalVolatileStateKey } from './symbols';

type ExternalSource = 'states' | 'functions' | 'components';

export class Externals {
  states: Record<string, t.ExternalState>;
  functions: Record<string, t.ExternalFunc>;
  components: Record<string, t.Component>;

  private lookup: Record<string, ExternalSource> = {};

  constructor(
    private readonly reka: Reka,
    opts?: Partial<RekaExternalsFactory>
  ) {
    this.states = Object.fromEntries(
      opts?.states?.map((state) => [state.name, state]) ?? []
    );

    this.functions = Object.fromEntries(
      opts?.functions?.(this.reka).map((func) => [func.name, func]) ?? []
    );

    this.components = Object.fromEntries(
      opts?.components?.map((component) => [component.name, component]) ?? []
    );

    this.createNamedLookup();

    this.initState();
  }

  private initState() {
    runInAction(() => {
      this.reka.volatile[ExternalVolatileStateKey] = Object.values(
        this.states
      ).reduce((accum, state) => {
        accum[state.name] = state.init;
        return accum;
      }, {});
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

  updateStateValue(key: string, value: any) {
    runInAction(() => {
      this.reka.volatile[ExternalVolatileStateKey][key] = value;
    });
  }

  getStateValue(key: string) {
    return this.reka.volatile[ExternalVolatileStateKey][key];
  }

  getState(key: string) {
    return this.states[key];
  }

  getComponent(name: string) {
    return this.components[name];
  }

  getFunc(name: string) {
    return this.functions[name];
  }

  all() {
    return [
      ...Object.values(this.components),
      ...Object.values(this.states),
      ...Object.values(this.functions),
    ];
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
