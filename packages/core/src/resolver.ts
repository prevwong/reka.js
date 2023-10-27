import * as t from '@rekajs/types';
import {
  computed,
  IComputedValue,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';

import { DisposableComputation } from './computation';
import { Reka } from './reka';
import {
  getKeyFromScopeDescription,
  getMaybeScopeDescriptionByNodeOwner,
  GetIdentifiableOpts,
  Scope,
} from './scope';

type CachedTemplateResolver = {
  computed: IComputedValue<void>;
  key: string;
};

type CachedComponentResolver = {
  computed: IComputedValue<void>;
  key: string;
};

export class Resolver {
  scopeRegistry: Map<string, Scope> = new Map();
  identifiersToIdentifiableDistance: Map<string, number>;
  identifiersToIdentifiable: Map<t.Identifier, t.Identifiable>;
  nodeToScope: Map<t.ASTNode, Scope>;

  private scope: Scope;
  private cachedComponentResolver: WeakMap<
    t.Component,
    CachedComponentResolver
  >;
  private cachedTemplateResolver: WeakMap<t.Template, CachedTemplateResolver>;

  declare rootResolverComputation: DisposableComputation<void>;

  constructor(readonly reka: Reka) {
    this.scope = new Scope(this, reka.program);

    this.identifiersToIdentifiableDistance = new Map();
    this.identifiersToIdentifiable = new Map();

    this.cachedComponentResolver = new WeakMap();
    this.cachedTemplateResolver = new WeakMap();

    this.rootResolverComputation = new DisposableComputation(
      () => {
        this.resolveProgram();
      },
      {
        keepAlive: true,
      }
    );

    this.nodeToScope = new Map();

    makeObservable(this, {
      identifiersToIdentifiableDistance: observable,
      nodeToScope: observable,
    });
  }

  getDistance(identifier: t.Identifier) {
    return this.identifiersToIdentifiableDistance.get(identifier.id);
  }

  getIdentifiablesAtNode(node: t.ASTNode, opts?: GetIdentifiableOpts) {
    const scope = this.nodeToScope.get(node);

    if (!scope) {
      return [];
    }

    return scope.getIdentifiables(opts);
  }

  getIdentifiableFromIdentifier(identifier: t.Identifier) {
    return this.identifiersToIdentifiable.get(identifier) || null;
  }

  removeDistance(identifier: t.Identifier) {
    runInAction(() => {
      this.identifiersToIdentifiableDistance.delete(identifier.id);
    });
  }

  private setDistance(identifier: t.Identifier, distance: number) {
    if (identifier.external) {
      return;
    }

    runInAction(() => {
      this.identifiersToIdentifiableDistance.set(identifier.id, distance);
    });
  }

  private bindIdentifierToIdentifiable(
    identifier: t.Identifier,
    identifiable: t.Identifiable
  ) {
    runInAction(() => {
      this.identifiersToIdentifiable.set(identifier, identifiable);
    });
  }

  private bindNodeToScope(node: t.ASTNode, scope: Scope) {
    runInAction(() => {
      this.nodeToScope.set(node, scope);
    });
  }

  unbindIdentifierToIdentifiable(identifier: t.Identifier) {
    runInAction(() => {
      this.identifiersToIdentifiable.delete(identifier);
    });
  }

  unbindNodeToScope(node: t.ASTNode) {
    runInAction(() => {
      this.nodeToScope.delete(node);
    });
  }

  private resolveExpr(expr: t.ASTNode, scope: Scope) {
    this.bindNodeToScope(expr, scope);

    if (expr instanceof t.Identifier) {
      if (expr.external) {
        const externalIdentifiable = this.reka.externals.get(expr.name);

        if (externalIdentifiable) {
          this.bindIdentifierToIdentifiable(expr, externalIdentifiable);
        }

        return;
      }

      const identifiableWithDistance = scope.getIdentifiableWithDistance(
        expr.name
      );

      if (!identifiableWithDistance) {
        this.setDistance(expr, -1);
        this.unbindIdentifierToIdentifiable(expr);
        return;
      }

      this.setDistance(expr, identifiableWithDistance.distance);
      this.bindIdentifierToIdentifiable(
        expr,
        identifiableWithDistance.identifiable
      );
    }

    // TODO: assignment should be handled as binary expr
    if (expr instanceof t.BinaryExpression || expr instanceof t.Assignment) {
      this.resolveExpr(expr.left, scope);
      this.resolveExpr(expr.right, scope);
    }

    if (expr instanceof t.ArrayExpression) {
      expr.elements.forEach((expr) => this.resolveExpr(expr, scope));
    }

    if (expr instanceof t.MemberExpression) {
      this.resolveExpr(expr.object, scope);
      this.resolveExpr(expr.property, scope);
    }

    if (expr instanceof t.ObjectExpression) {
      Object.keys(expr.properties).forEach((key) => {
        this.resolveExpr(expr.properties[key], scope);
      });
    }

    if (expr instanceof t.Block) {
      expr.statements.forEach((statement) => {
        this.resolveExpr(statement, scope);
      });
    }

    if (expr instanceof t.Func) {
      const funcScope = scope.inherit(expr);

      expr.params.forEach((param) => {
        this.resolveExpr(param, funcScope);
      });

      this.resolveExpr(expr.body, funcScope);
    }

    if (expr instanceof t.CallExpression) {
      this.resolveExpr(expr.identifier, scope);

      expr.arguments.forEach((arg) => {
        this.resolveExpr(arg, scope);
      });
    }

    if (expr instanceof t.IfStatement) {
      this.resolveExpr(expr.condition, scope);
      this.resolveExpr(expr.consequent, scope);
    }

    if (expr instanceof t.ConditionalExpression) {
      this.resolveExpr(expr.condition, scope);
      this.resolveExpr(expr.consequent, scope);
      this.resolveExpr(expr.alternate, scope);
    }
  }

  private resolveComponent(component: t.Component, scope: Scope) {
    if (component instanceof t.RekaComponent) {
      let cache = this.cachedComponentResolver.get(component);

      const key = scope.toString();

      if (!cache || (cache && cache.key !== key)) {
        cache = {
          computed: computed(() => {
            const componentScope = scope.inherit(component);

            this.bindNodeToScope(component, componentScope);

            component.props.forEach((prop) => {
              this.resolveVariable(prop, componentScope);
            });

            component.state.forEach((state) => {
              this.resolveVariable(state, componentScope);
            });

            this.resolveTemplate(component.template, componentScope);
          }),
          key: scope.toString(),
        };
        this.cachedComponentResolver.set(component, cache);
      }

      cache.computed.get();
      scope.defineIdentifiable(component);
    }
  }

  private resolveTemplate(template: t.Template, scope: Scope) {
    let cache = this.cachedTemplateResolver.get(template);
    const key = scope.toString();

    if (!cache || (cache && cache.key !== key)) {
      const templateScope = scope.inherit(template);

      this.bindNodeToScope(template, templateScope);

      let eachIndex: string | null = null;
      let eachAliasName: string | null = null;

      cache = {
        key,
        computed: computed(() => {
          if (template instanceof t.ComponentTemplate) {
            this.resolveExpr(template.component, templateScope);
          }

          if (template.each) {
            this.resolveExpr(template.each.iterator, templateScope);

            if (template.each.alias) {
              if (eachAliasName && eachAliasName !== template.each.alias.name) {
                templateScope.removeIdentifiableByName(eachAliasName);
              }

              templateScope.defineIdentifiable(template.each.alias);
              eachAliasName = template.each.alias.name;
            }

            if (template.each.index) {
              if (eachIndex && eachIndex !== template.each.index.name) {
                templateScope.removeIdentifiableByName(eachIndex);
              }

              eachIndex = template.each.index.name;
              templateScope.defineIdentifiable(template.each.index);
            } else {
              if (eachIndex) {
                templateScope.removeIdentifiableByName(eachIndex);
                eachIndex = null;
              }
            }
          }

          if (template.if) {
            this.resolveExpr(template.if, templateScope);
          }

          if (template.classList) {
            this.resolveExpr(template.classList, templateScope);
          }

          Object.values(template.props).forEach((propValue) => {
            this.resolveExpr(propValue, templateScope);
          });

          if (t.is(template, t.SlottableTemplate)) {
            template.children.forEach((child) => {
              this.resolveTemplate(child, templateScope);
            });
          }
        }),
      };

      this.cachedTemplateResolver.set(template, cache);
    }

    cache.computed.get();
  }

  private resolveVariable(variable: t.Variable, scope: Scope) {
    this.bindNodeToScope(variable, scope);

    if (variable.init) {
      this.resolveExpr(variable.init, scope);
    }

    scope.defineIdentifiable(variable);
  }

  private resolveProgram() {
    this.scope.clear();

    const program = this.reka.program;

    this.bindNodeToScope(program, this.scope);

    program.globals.forEach((global) => {
      this.resolveVariable(global, this.scope);
    });

    program.components.forEach((component) => {
      this.scope.defineIdentifiable(component);
    });

    const globalNames = [...program.globals, ...program.components].map(
      (globalOrComponent) => globalOrComponent.name
    );

    this.scope.forEach((identifiable) => {
      if (globalNames.includes(identifiable.name)) {
        return;
      }

      this.scope.removeIdentifiableByName(identifiable.name);
    });

    program.components.forEach((component) => {
      this.resolveComponent(component, this.scope);
    });
  }

  resolve() {
    this.rootResolverComputation.get();
  }

  dispose() {
    this.rootResolverComputation.dispose();
  }

  cleanupDisposedNode(node: t.ASTNode) {
    if (node instanceof t.Identifier) {
      this.removeDistance(node);
      this.unbindIdentifierToIdentifiable(node);
    }

    this.unbindNodeToScope(node);

    const scopeDescription = getMaybeScopeDescriptionByNodeOwner(node);

    if (!scopeDescription) {
      return;
    }

    const scopeId = getKeyFromScopeDescription(scopeDescription);

    this.scopeRegistry.delete(scopeId);
  }
}
