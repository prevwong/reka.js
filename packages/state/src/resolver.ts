import * as t from '@composite/types';
import {
  computed,
  IComputedValue,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';

import { Scope } from './scope';
import { Composite } from './state';

type CachedTemplateResolver = {
  computed: IComputedValue<void>;
  key: string;
};

type CachedComponentResolver = {
  computed: IComputedValue<void>;
  key: string;
};

export class Resolver {
  identifiersToVariableDistance: Map<t.Identifier, number>;

  private scope: Scope;
  private cachedComponentResolver: WeakMap<
    t.Component,
    CachedComponentResolver
  >;
  private cachedTemplateResolver: WeakMap<t.Template, CachedTemplateResolver>;

  declare cachedGlobalsComputation: IComputedValue<void>;
  declare cachedComponentsComputation: IComputedValue<void>;

  constructor(readonly composite: Composite) {
    this.scope = new Scope('root');
    this.identifiersToVariableDistance = new Map();

    this.cachedComponentResolver = new WeakMap();
    this.cachedTemplateResolver = new WeakMap();

    makeObservable(this, {
      identifiersToVariableDistance: observable,
    });
  }

  getDistance(identifier: t.Identifier) {
    return this.identifiersToVariableDistance.get(identifier);
  }

  removeDistance(identifier: t.Identifier) {
    runInAction(() => {
      this.identifiersToVariableDistance.delete(identifier);
    });
  }

  private setDistance(identifier: t.Identifier, distance: number) {
    runInAction(() => {
      this.identifiersToVariableDistance.set(identifier, distance);
    });
  }

  resolveExpr(expr: t.Any, scope: Scope) {
    if (expr instanceof t.Identifier) {
      this.setDistance(expr, scope.getDistance(expr.name));
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
      expr.params.forEach((param) => {
        this.resolveExpr(param, scope);
      });

      this.resolveExpr(expr.body, scope);
    }

    if (expr instanceof t.CallExpression) {
      this.resolveExpr(expr.identifier, scope);

      expr.arguments.forEach((arg) => {
        this.resolveExpr(arg, scope);
      });
    }

    if (expr instanceof t.ExternalGlobal) {
      Object.values(expr.params).forEach((param) => {
        this.resolveExpr(param, scope);
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

  resolveComponent(component: t.Component, scope: Scope) {
    if (component instanceof t.CompositeComponent) {
      let cache = this.cachedComponentResolver.get(component);

      if (!cache) {
        cache = {
          computed: computed(
            () => {
              const componentScope = new Scope(component.name, scope);

              component.props.forEach((prop) => {
                componentScope.defineVariableName(prop.name);
                if (prop.init) {
                  this.resolveExpr(prop.init, scope);
                }
              });

              component.state.forEach((state) => {
                this.resolveVal(state, componentScope);
              });

              this.resolveTemplate(component.template, componentScope);
            },
            {
              keepAlive: true,
            }
          ),
          key: scope.toString(),
        };
        this.cachedComponentResolver.set(component, cache);
      }

      cache.computed.get();
    }
  }

  resolveTemplate(template: t.Template, scope: Scope) {
    let cache = this.cachedTemplateResolver.get(template);
    const key = scope.toString();

    if (!cache || (cache && cache.key !== key)) {
      const templateScope = new Scope(template.id, scope);

      let eachIndex: string | null = null;

      cache = {
        key,
        computed: computed(() => {
          if (template instanceof t.ComponentTemplate) {
            this.setDistance(
              template.component,
              templateScope.getDistance(template.component.name)
            );
          }

          if (template.each) {
            this.setDistance(
              template.each.iterator,
              templateScope.getDistance(template.each.iterator.name)
            );

            if (template.each.alias) {
              templateScope.defineVariableName(template.each.alias.name);
            }

            if (template.each.index) {
              eachIndex = template.each.index.name;
              templateScope.defineVariableName(template.each.index.name);
            } else {
              if (eachIndex) {
                templateScope.removeVariableName(eachIndex);
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

          template.children.forEach((child) => {
            this.resolveTemplate(child, templateScope);
          });
        }),
      };

      this.cachedTemplateResolver.set(template, cache);
    }

    cache.computed.get();
  }

  resolveVal(val: t.Val, scope: Scope) {
    this.resolveExpr(val.init, scope);
    scope.defineVariableName(val.name);
  }

  resolveProgram() {
    const program = this.composite.program;

    if (!this.cachedGlobalsComputation) {
      this.cachedGlobalsComputation = computed(() => {
        program.globals.forEach((global) => {
          this.resolveVal(global, this.scope);
        });
      });
    }

    if (!this.cachedComponentsComputation) {
      this.cachedComponentsComputation = computed(() => {
        program.components.forEach((component) => {
          this.scope.defineVariableName(component.name);
        });
      });
    }

    this.cachedGlobalsComputation.get();
    this.cachedComponentsComputation.get();

    program.components.forEach((component) => {
      this.resolveComponent(component, this.scope);
    });
  }
}
