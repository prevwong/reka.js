import * as t from '@rekajs/types';
import { invariant } from '@rekajs/utils';
import { action, makeObservable, observable, untracked } from 'mobx';

import { ScopeDescription, VariableWithScope } from './interfaces';
import { Resolver } from './resolver';

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

export const getKeyFromScopeDescription = (description: ScopeDescription) => {
  return `${description.level}<${description.id}>`;
};

export const getScopePath = (description: ScopeDescription, parent?: Scope) => {
  if (!parent) {
    return getKeyFromScopeDescription(description);
  }

  return `${parent.path}.${getKeyFromScopeDescription(description)}`;
};

export const getMaybeScopeDescriptionByNodeOwner = (
  node: t.ASTNode
): ScopeDescription | null => {
  if (t.is(node, t.Program)) {
    return {
      level: 'global',
      id: node.id,
    };
  }

  if (t.is(node, t.Component)) {
    return {
      level: 'component',
      id: node.id,
    };
  }

  if (t.is(node, t.Template)) {
    return {
      level: 'template',
      id: node.id,
    };
  }

  if (t.is(node, t.Func)) {
    return {
      level: 'function',
      id: node.id,
    };
  }

  return null;
};

export const getScopeDescriptionByNodeOwner = (
  node: t.ASTNode
): ScopeDescription => {
  const description = getMaybeScopeDescriptionByNodeOwner(node);

  invariant(
    description,
    `Unable to infer scope description from node ${node.type}<${node.id}>`
  );

  return description;
};

export class Scope {
  variableNames: Map<string, t.Variable>;

  description: ScopeDescription;

  path: string;

  constructor(
    readonly resolver: Resolver,
    descriptionOrNode: ScopeDescription | t.ASTNode,
    readonly parent?: Scope
  ) {
    this.variableNames = new Map();
    this.description = t.is(descriptionOrNode, t.ASTNode)
      ? getScopeDescriptionByNodeOwner(descriptionOrNode)
      : descriptionOrNode;

    this.path = getScopePath(this.description, this.parent);

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

    if (opts.parent && this.parent) {
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

    if (!opts.parent) {
      let i = 0;

      for (const [key, variable] of this.variableNames) {
        if (
          opts.before &&
          isBeforeIndex(opts.before) &&
          i >= opts.before.index
        ) {
          break;
        }

        if (
          opts.before &&
          isBeforeName(opts.before) &&
          key == opts.before.name
        ) {
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

  inherit(descriptionOrNode: ScopeDescription | t.ASTNode) {
    const description = t.is(descriptionOrNode, t.ASTNode)
      ? getScopeDescriptionByNodeOwner(descriptionOrNode)
      : descriptionOrNode;

    const key = getKeyFromScopeDescription(description);

    const existing = this.resolver.scopeRegistry.get(key);

    if (existing) {
      if (existing.path === getScopePath(description, this)) {
        existing.clear();

        return existing;
      }

      this.resolver.scopeRegistry.delete(key);
    }

    return new Scope(this.resolver, description, this);
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
        if (!key) {
          continue;
        }

        keyToId.push(`${key}`);
      }

      let key = `${this.description.id}<${keyToId.join('.')}>`;

      if (this.parent) {
        key = this.parent.toString() + '.' + key;
      }

      return key;
    });
  }
}
