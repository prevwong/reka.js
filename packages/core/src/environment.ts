import * as t from '@rekajs/types';
import { action, makeObservable, observable } from 'mobx';

import { Reka } from './reka';

export class Environment {
  bindings: Map<string, any>;

  constructor(readonly reka: Reka, readonly parent?: Environment) {
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
      return this.reka.externals.states[name] || undefined;
    }

    return this.parent.getByName(name);
  }

  getByIdentifier(identifier: t.Identifier) {
    const distance = this.reka.resolver.getDistance(identifier);

    if (distance === undefined || distance === -1) {
      return this.reka.externals.states[identifier.name];
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
    return new Environment(this.reka, this);
  }

  clone() {
    return new Environment(this.reka, this.parent);
  }
}
