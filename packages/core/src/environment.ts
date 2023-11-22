import * as t from '@rekajs/types';
import { getRandomId, invariant } from '@rekajs/utils';
import { action, makeObservable, observable } from 'mobx';

import { Reka } from './reka';

type EnvironmentValue =
  | string
  | number
  | boolean
  | Record<string, any>
  | Array<any>
  | t.Component;

type Binding = {
  value: EnvironmentValue;
  readonly: boolean;
};

type BindingKey = string | Symbol;

export class Environment {
  id = getRandomId();

  bindings: Map<BindingKey, Binding>;

  constructor(readonly reka: Reka, readonly parent?: Environment) {
    this.bindings = new Map();

    makeObservable(this, {
      bindings: observable,
      set: action,
      delete: action,
    });
  }

  reassign(identifier: t.Identifier, value: any) {
    const distance = this.reka.head.resolver.getDistance(identifier);

    if (distance === undefined) {
      throw new Error();
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let env: Environment = this;

    for (let i = 0; i < distance; i++) {
      const parent = env.parent;

      if (!parent) {
        return undefined;
      }

      env = parent;
    }

    const binding = env.bindings.get(identifier.name);

    if (!binding) {
      throw new Error();
    }

    if (binding.readonly) {
      // TODO: handle error
      console.warn(
        `Cannot reassign readonly value "${identifier.name}" (${identifier.id})`
      );
      return;
    }

    binding.value = value;
  }

  set(name: BindingKey, binding: Binding) {
    this.bindings.set(name, binding);
  }

  delete(name: BindingKey) {
    const binding = this.bindings.get(name);
    if (!binding) {
      return;
    }

    this.bindings.delete(name);
  }

  getByName(
    name: BindingKey,
    external?: boolean,
    getInCurrentEnvironmentOnly?: boolean
  ) {
    if (external) {
      invariant(typeof name === 'string', 'Invalid external binding key');

      return this.reka.externals.get(name);
    }

    const valueInCurrentEnvironment = this.bindings.get(name)?.value;

    if (
      valueInCurrentEnvironment !== undefined ||
      getInCurrentEnvironmentOnly
    ) {
      return valueInCurrentEnvironment;
    }

    if (!this.parent) {
      return undefined;
    }

    return this.parent.getByName(name);
  }

  getByIdentifier(identifier: t.Identifier) {
    if (identifier.external) {
      const external = this.reka.externals.get(identifier.name);

      if (t.is(external, t.ExternalState)) {
        return this.reka.externals.getStateValue(identifier.name);
      }

      if (t.is(external, t.ExternalFunc)) {
        return external.func;
      }

      if (t.is(external, t.ExternalComponent)) {
        return external;
      }
    }

    const distance = this.reka.head.resolver.getDistance(identifier);

    if (distance === undefined || distance === -1) {
      throw new Error(`Value for "${identifier.name}" not found in scope`);
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let env: Environment = this;

    for (let i = 0; i < distance; i++) {
      const parent = env.parent;

      if (!parent) {
        return undefined;
      }

      env = parent;
    }

    return env.bindings.get(identifier.name)?.value;
  }

  inherit() {
    return new Environment(this.reka, this);
  }

  clone() {
    return new Environment(this.reka, this.parent);
  }
}
