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
  GetVariablesOpts,
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
  identifiersToVariableDistance: Map<string, number>;
  identifiersToVariable: Map<t.Identifier, t.Variable>;
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

    this.identifiersToVariableDistance = new Map();
    this.identifiersToVariable = new Map();

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
      identifiersToVariableDistance: observable,
      nodeToScope: observable,
    });
  }

  getDistance(identifier: t.Identifier) {
    return this.identifiersToVariableDistance.get(identifier.id);
  }

  getVariablesAtNode(node: t.ASTNode, opts?: GetVariablesOpts) {
    const scope = this.nodeToScope.get(node);

    if (!scope) {
      return [];
    }

    return scope.getVariables(opts);
  }

  getVariableFromIdentifier(identifier: t.Identifier) {
    return this.identifiersToVariable.get(identifier) || null;
  }

  removeDistance(identifier: t.Identifier) {
    runInAction(() => {
      this.identifiersToVariableDistance.delete(identifier.id);
    });
  }

  private setDistance(identifier: t.Identifier, distance: number) {
    if (identifier.external) {
      return;
    }

    runInAction(() => {
      this.identifiersToVariableDistance.set(identifier.id, distance);
    });
  }

  private bindIdentifierToVariable(
    identifier: t.Identifier,
    variable: t.Variable
  ) {
    runInAction(() => {
      this.identifiersToVariable.set(identifier, variable);
    });
  }

  private bindNodeToScope(node: t.ASTNode, scope: Scope) {
    runInAction(() => {
      this.nodeToScope.set(node, scope);
    });
  }

  unbindIdentifierToVariable(identifier: t.Identifier) {
    runInAction(() => {
      this.identifiersToVariable.delete(identifier);
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
        const externalVariable = this.reka.externals.get(expr.name);

        if (externalVariable) {
          this.bindIdentifierToVariable(expr, externalVariable);
        }

        return;
      }

      const variableWithDistance = scope.getVariableWithDistance(expr.name);

      if (!variableWithDistance) {
        this.setDistance(expr, -1);
        this.unbindIdentifierToVariable(expr);
        return;
      }

      this.setDistance(expr, variableWithDistance.distance);
      this.bindIdentifierToVariable(expr, variableWithDistance.variable);
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

      Object.keys(expr.params).forEach((param) => {
        this.resolveExpr(expr.params[param], scope);
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
              componentScope.defineVariable(prop);
              this.bindNodeToScope(prop, componentScope);

              if (prop.init) {
                this.resolveExpr(prop.init, scope);
              }
            });

            component.state.forEach((state) => {
              this.resolveVal(state, componentScope);
            });

            this.resolveTemplate(component.template, componentScope);
          }),
          key: scope.toString(),
        };
        this.cachedComponentResolver.set(component, cache);
      }

      cache.computed.get();
      scope.defineVariable(component);
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
                templateScope.removeVariableByName(eachAliasName);
              }

              templateScope.defineVariable(template.each.alias);
              eachAliasName = template.each.alias.name;
            }

            if (template.each.index) {
              if (eachIndex && eachIndex !== template.each.index.name) {
                templateScope.removeVariableByName(eachIndex);
              }

              eachIndex = template.each.index.name;
              templateScope.defineVariable(template.each.index);
            } else {
              if (eachIndex) {
                templateScope.removeVariableByName(eachIndex);
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

  private resolveVal(val: t.Val, scope: Scope) {
    this.bindNodeToScope(val, scope);
    this.resolveExpr(val.init, scope);
    scope.defineVariable(val);
  }

  private resolveProgram() {
    this.scope.clear();

    const program = this.reka.program;

    this.bindNodeToScope(program, this.scope);

    program.globals.forEach((global) => {
      this.resolveVal(global, this.scope);
    });

    program.components.forEach((component) => {
      this.scope.defineVariable(component);
    });

    const globalNames = [...program.globals, ...program.components].map(
      (globalOrComponent) => globalOrComponent.name
    );

    this.scope.forEach((variable) => {
      if (globalNames.includes(variable.name)) {
        return;
      }

      this.scope.removeVariableByName(variable.name);
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
      this.unbindIdentifierToVariable(node);
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
