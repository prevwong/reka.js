import * as t from "@composite/types";
import { computed, IComputedValue, makeObservable, observable } from "mobx";

import { Scope } from "./scope";
import { State } from "./state";

type CachedTemplateResolver = {
  computed: IComputedValue<void>;
  key: string;
};

type CachedComponentResolver = {
  computed: IComputedValue<void>;
  key: string;
};

export class Resolver {
  private scope: Scope;

  identifiersToVariableDistance: Map<t.Identifier, number>;

  private cachedComponentResolver: WeakMap<
    t.Component,
    CachedComponentResolver
  >;
  private cachedTemplateResolver: WeakMap<t.Template, CachedTemplateResolver>;

  declare cachedGlobalsComputation: IComputedValue<void>;
  declare cachedComponentsComputation: IComputedValue<void>;

  constructor(readonly state: State) {
    this.scope = new Scope("root");
    this.identifiersToVariableDistance = new Map();

    this.cachedComponentResolver = new WeakMap();
    this.cachedTemplateResolver = new WeakMap();

    makeObservable(this, {
      identifiersToVariableDistance: observable,
    });
  }

  resolveExpr(expr: t.Any, scope: Scope) {
    if (expr instanceof t.Identifier) {
      this.identifiersToVariableDistance.set(
        expr,
        scope.getDistance(expr.name)
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
      expr.params.forEach((param) => {
        this.resolveExpr(param, scope);
      });

      this.resolveExpr(expr.body, scope);
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

      cache = {
        key,
        computed: computed(() => {
          if (template instanceof t.ComponentTemplate) {
            this.identifiersToVariableDistance.set(
              template.component,
              templateScope.getDistance(template.component.name)
            );
          }

          if (template.each) {
            this.identifiersToVariableDistance.set(
              template.each.iterator,
              templateScope.getDistance(template.each.iterator.name)
            );

            if (template.each.alias) {
              templateScope.defineVariableName(template.each.alias.name);
            }

            if (template.each.index) {
              templateScope.defineVariableName(template.each.index.name);
            }
          }

          if (template.if) {
            this.resolveExpr(template.if, templateScope);
            // this.identifiersToVariableDistance.set(template.if, templateScope.getDistance(template.if))
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
    const program = this.state.root;

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
