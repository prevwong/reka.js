import * as t from '@rekajs/types';

import { ScopeDescription, VariableWithScope } from './interfaces';
import { Reka } from './reka';
import { action, makeObservable, observable, untracked } from 'mobx';
import { Resolver } from './resolver';
import { computedFn } from 'mobx-utils';
import { invariant } from '@rekajs/utils';

type BeforeIndex = {
  index: number;
};

type BeforeName = {
  name: string;
};

type Before = BeforeIndex | BeforeName;

export type GetVariablesOpts = {
  parent?: boolean;
  includeExternals?: boolean;
  includeAncestors?: boolean;
  filter?: (variable: VariableWithScope) => boolean;
  before?: Before;
};

const isBeforeIndex = (before: Before): before is BeforeIndex => {
  if ((before as BeforeIndex).index !== undefined) {
    return true;
  }

  return false;
};

const isBeforeName = (before: Before): before is BeforeName => {
  if ((before as BeforeName).name !== undefined) {
    return true;
  }

  return false;
};

const getKeyFromScopeDescription = (description: ScopeDescription) => {
  return `${description.level}<${description.id}>`;
};

export class Scope {
  variableNames: Map<string, t.Variable>;

  constructor(
    readonly resolver: Resolver,
    readonly description: ScopeDescription,
    readonly parent?: Scope
  ) {
    this.variableNames = new Map();

    invariant(
      !this.resolver.scopeRegistry.get(this.key),
      `Duplicate scope found! ${this.key}`
    );

    this.resolver.scopeRegistry.set(this.key, this);

    makeObservable(this, {
      variableNames: observable,
      defineVariable: action,
      removeVariableByName: action,
      clear: action,
    });
  }

  get reka() {
    return this.resolver.reka;
  }

  get key() {
    return getKeyFromScopeDescription(this.description);
  }

  getVariables(maybeOpts?: GetVariablesOpts): VariableWithScope[] {
    const opts = {
      parent: false,
      includeExternals: true,
      includeAncestors: true,
      ...(maybeOpts ?? {}),
    };

    if (opts.parent) {
      if (!this.parent) {
        return [];
      }

      return this.parent.getVariables({
        ...opts,
        parent: false,
      });
    }

    const variables = new Map<string, VariableWithScope>();

    const addVariable = (scope: ScopeDescription, variable: t.Variable) => {
      if (opts.filter && !opts.filter({ variable, scope })) {
        return;
      }

      variables.set(variable.name, {
        scope,
        variable,
      });
    };

    let i = 0;

    for (const [key, variable] of this.variableNames) {
      if (opts.before && isBeforeIndex(opts.before) && i >= opts.before.index) {
        break;
      }

      if (opts.before && isBeforeName(opts.before) && key == opts.before.name) {
        break;
      }

      i++;

      addVariable(this.description, variable);
    }

    if (opts.includeAncestors) {
      let parent = this.parent;

      while (parent) {
        for (const [name, variable] of parent.variableNames) {
          if (variables.has(name)) {
            continue;
          }

          addVariable(parent.description, variable);
        }
        parent = parent.parent;
      }
    }

    if (opts.includeExternals) {
      this.reka.externals.all().forEach((v) => {
        addVariable(
          {
            level: 'external',
            id: this.reka.id,
          },
          v
        );
      });
    }

    return [...variables.values()];
  }

  inherit(desc: ScopeDescription) {
    const key = getKeyFromScopeDescription(desc);

    const existing = this.resolver.scopeRegistry.get(key);

    if (existing) {
      existing.clear();

      return existing;
    }

    return new Scope(this.resolver, desc, this);
  }

  defineVariable(variable: t.Variable) {
    this.variableNames.set(variable.name, variable);
  }

  removeVariableByName(name: string) {
    this.variableNames.delete(name);
  }

  clear() {
    this.variableNames.clear();
  }

  getVariableWithDistance(name: string) {
    return untracked(() => {
      let distance = 0;

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let scope: Scope = this;

      do {
        const variable = scope.variableNames.get(name);

        if (variable) {
          return {
            variable,
            distance,
          };
        }
      } while (scope.parent && (scope = scope.parent) && (distance += 1));

      return null;
    });
  }

  has(name: string) {
    return this.variableNames.has(name);
  }

  forEach(cb: (variable: t.Variable) => void) {
    for (const [_, variable] of this.variableNames) {
      cb(variable);
    }
  }

  toString() {
    return untracked(() => {
      const keyToId: string[] = [];

      for (const [key] of this.variableNames) {
        keyToId.push(`${key}`);
      }

      let key = keyToId.join(`,`);

      if (this.parent) {
        key = this.parent.toString() + ',' + key;
      }

      return key;
    });
  }
}
