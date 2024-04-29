import * as t from '@rekajs/types';
import { invariant } from '@rekajs/utils';
import { action, makeObservable, observable, untracked } from 'mobx';

import { ScopeDescription, IdentifiableWithScope } from './interfaces';
import { Resolver } from './resolver';

type BeforeIndex = {
  index: number;
};

type BeforeName = {
  name: string;
};

type Before = BeforeIndex | BeforeName;

export type GetIdentifiableOpts = {
  parent?: boolean;
  includeExternals?: boolean;
  includeAncestors?: boolean;
  filter?: (identifiable: IdentifiableWithScope) => boolean;
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

export type ScopeContext = {
  component?: t.Component;
};

export class Scope {
  identifiables: Map<string, t.Identifiable>;

  description: ScopeDescription;

  path: string;

  context: Record<string, ScopeDescription> | null;

  constructor(
    readonly resolver: Resolver,
    descriptionOrNode: ScopeDescription | t.ASTNode,
    readonly parent?: Scope
  ) {
    this.identifiables = new Map();
    this.description = t.is(descriptionOrNode, t.ASTNode)
      ? getScopeDescriptionByNodeOwner(descriptionOrNode)
      : descriptionOrNode;

    this.path = getScopePath(this.description, this.parent);

    invariant(
      !this.resolver.scopeRegistry.get(this.key),
      `Duplicate scope found! ${this.key}`
    );

    this.resolver.scopeRegistry.set(this.key, this);

    this.context = null;

    if (parent) {
      this.context = {
        ...(parent.context ?? {}),
        [parent.description.level]: parent.description,
      };
    }

    makeObservable(this, {
      identifiables: observable,
      defineIdentifiable: action,
      removeIdentifiableByName: action,
      clear: action,
    });
  }

  get reka() {
    return this.resolver.reka;
  }

  get key() {
    return getKeyFromScopeDescription(this.description);
  }

  getIdentifiables(maybeOpts?: GetIdentifiableOpts): IdentifiableWithScope[] {
    const opts = {
      parent: false,
      includeExternals: true,
      includeAncestors: true,
      ...(maybeOpts ?? {}),
    };

    if (opts.parent && this.parent) {
      return this.parent.getIdentifiables({
        ...opts,
        parent: false,
      });
    }

    const identifiables = new Map<string, IdentifiableWithScope>();

    const addIdentifiable = (
      scope: ScopeDescription,
      identifiable: t.Identifiable
    ) => {
      if (opts.filter && !opts.filter({ identifiable, scope })) {
        return;
      }

      identifiables.set(identifiable.name, {
        scope,
        identifiable,
      });
    };

    if (!opts.parent) {
      let i = 0;

      for (const [key, identifiable] of this.identifiables) {
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

        addIdentifiable(this.description, identifiable);
      }

      if (opts.includeAncestors) {
        let parent = this.parent;

        while (parent) {
          for (const [name, identifiable] of parent.identifiables) {
            if (identifiables.has(name)) {
              continue;
            }

            addIdentifiable(parent.description, identifiable);
          }
          parent = parent.parent;
        }
      }
    }

    if (opts.includeExternals) {
      this.reka.externals.all().forEach((v) => {
        addIdentifiable(
          {
            level: 'external',
            id: this.reka.id,
          },
          v
        );
      });
    }

    return [...identifiables.values()];
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

  defineIdentifiable(identifiable: t.Identifiable) {
    this.identifiables.set(identifiable.name, identifiable);
  }

  removeIdentifiableByName(name: string) {
    this.identifiables.delete(name);
  }

  clear() {
    this.identifiables.clear();
  }

  getIdentifiableWithDistance(name: string) {
    return untracked(() => {
      let distance = 0;

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let scope: Scope = this;

      do {
        const identifiable = scope.identifiables.get(name);

        if (identifiable) {
          return {
            identifiable,
            distance,
          };
        }
      } while (scope.parent && (scope = scope.parent) && (distance += 1));

      return null;
    });
  }

  has(name: string) {
    return this.identifiables.has(name);
  }

  forEach(cb: (identifiable: t.Identifiable) => void) {
    for (const [_, identifiable] of this.identifiables) {
      cb(identifiable);
    }
  }

  toString() {
    return untracked(() => {
      const keyToId: string[] = [];

      for (const [key] of this.identifiables) {
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
