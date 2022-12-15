import * as t from '@composite/types';
import { action, makeObservable, observable } from 'mobx';

import { State } from './state';

export class Environment {
  bindings: Map<string, any>;

  constructor(readonly state: State, readonly parent?: Environment) {
    this.bindings = new Map();

    makeObservable(this, {
      bindings: observable,
      set: action,
      delete: action,
    });
  }

  set(name: string, value: any, reassignment?: boolean) {
    if (!reassignment) {
      this.bindings.set(name, value);
      return;
    }

    if (this.bindings.get(name) !== undefined) {
      this.bindings.set(name, value);
      return;
    }

    if (!this.parent) {
      return;
    }

    return this.parent.set(name, value, reassignment);
  }

  delete(name: string) {
    const binding = this.bindings.get(name);
    if (!binding) {
      return;
    }

    this.bindings.delete(name);
  }

  getByName(name: string) {
    const v = this.bindings.get(name);

    if (v !== undefined) {
      return v;
    }

    if (!this.parent) {
      return this.state.config.globals[name] || undefined;
    }

    return this.parent.getByName(name);
  }

  getByIdentifier(identifier: t.Identifier) {
    const distance =
      this.state.resolver.identifiersToVariableDistance.get(identifier);

    if (distance === undefined || distance === -1) {
      return this.state.config.globals[identifier.name] || undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let env: Environment = this;

    for (let i = 0; i < distance; i++) {
      const parent = env.parent;

      if (!parent) {
        throw new Error();
      }

      env = parent;
    }

    return env.getByName(identifier.name);
  }

  inherit() {
    return new Environment(this.state, this);
  }

  clone() {
    return new Environment(this.state, this.parent);
  }
}
