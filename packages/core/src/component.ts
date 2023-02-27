import * as t from '@rekajs/types';
import { computed, IComputedValue, runInAction, untracked } from 'mobx';

import { Environment } from './environment';
import { TemplateEvaluateContext, ViewEvaluator } from './evaluator';
import { createKey } from './utils';

type ComponentViewTreeComputationCache = {
  component: t.Component;
  computed: IComputedValue<t.RekaComponentView[] | t.ExternalComponentView[]>;
};

export const ComponentSlotBindingKey = Symbol('$$children');

export class ComponentViewEvaluator {
  private declare resolveComponentComputation: IComputedValue<
    t.RekaComponentView[] | t.ErrorSystemView[] | t.ExternalComponentView[]
  >;
  private declare componentViewTreeComputation: ComponentViewTreeComputationCache | null;

  private declare rekaComponentRootComputation: IComputedValue<t.View> | null;
  private declare rekaComponentPropsComputation: IComputedValue<void> | null;
  private declare rekaComponentStateComputation: IComputedValue<void> | null;

  private readonly tree: ViewEvaluator;
  private readonly ctx: TemplateEvaluateContext;
  private readonly template: t.ComponentTemplate;

  private readonly env: Environment;

  readonly key: string;

  constructor(
    tree: ViewEvaluator,
    ctx: TemplateEvaluateContext,
    template: t.ComponentTemplate,
    env: Environment,
    private readonly: boolean = false
  ) {
    this.tree = tree;
    this.ctx = ctx;
    this.template = template;
    this.key = createKey(this.ctx.path);

    this.env = env;

    this.rekaComponentStateComputation = null;
  }

  private computeViewTreeForComponent(component: t.Component) {
    if (component instanceof t.ExternalComponent) {
      this.rekaComponentPropsComputation = null;
      this.rekaComponentStateComputation = null;

      return [
        t.externalComponentView({
          component,
          key: this.key,
          template: this.template,
          props: Object.keys(this.template.props).reduce(
            (accum, key) => ({
              ...accum,
              [key]: this.tree.computeExpr(
                this.template.props[key],
                this.ctx.env
              ),
            }),
            {}
          ),
        }),
      ];
    }

    if (component instanceof t.RekaComponent) {
      const componentViewTree = t.rekaComponentView({
        key: this.key,
        component,
        render: [],
        template: this.template,
      });

      untracked(() => {
        if (this.rekaComponentRootComputation) {
          return this.rekaComponentRootComputation.get();
        }

        this.rekaComponentRootComputation = computed(() => {
          let render: t.View[] = [];
          if (!this.rekaComponentPropsComputation) {
            this.rekaComponentPropsComputation = computed(() => {
              const slot = this.template.children.flatMap((child) =>
                this.tree.computeTemplate(child, {
                  ...this.ctx,
                  path: [...this.ctx.path, child.id],
                })
              );

              this.env.set(ComponentSlotBindingKey, {
                value: slot,
                readonly: true,
              });

              component.props.forEach((prop) => {
                const getPropValue = () => {
                  let propValue: any;

                  if (this.template.props[prop.name]) {
                    propValue = this.tree.computeExpr(
                      this.template.props[prop.name],
                      this.ctx.env
                    );
                  }

                  if (!propValue && prop.init) {
                    propValue = this.tree.computeExpr(prop.init, this.ctx.env);
                  }

                  return propValue;
                };

                let propValue = getPropValue();

                if (
                  prop.name === 'className' &&
                  this.ctx.classList.length > 0
                ) {
                  propValue = [propValue, ...this.ctx.classList]
                    .filter(Boolean)
                    .join(' ');
                }

                this.env.set(prop.name, {
                  value: propValue,
                  readonly: true,
                });
              });
            });
          }

          if (!this.rekaComponentStateComputation) {
            this.rekaComponentStateComputation = computed(() => {
              component.state.forEach((val) => {
                this.env.set(val.name, {
                  value: this.tree.computeExpr(val.init, this.env),
                  readonly: false,
                });
              });
            });
          }

          try {
            this.rekaComponentPropsComputation.get();
            this.rekaComponentStateComputation.get();

            render = this.tree.computeTemplate(component.template, {
              path: [this.key, 'root'],
              env: this.env,
              classList: [],
            });
          } catch (err) {
            render = [
              t.errorSystemView({
                error: String(err),
                template: this.template,
                key: this.key,
              }),
            ];
          }

          runInAction(() => {
            componentViewTree.render.length = render.length;
            for (let i = 0; i < render.length; i++) {
              if (componentViewTree.render[i] === render[i]) {
                continue;
              }

              componentViewTree.render[i] = render[i];
            }
          });

          return componentViewTree;
        });

        return this.rekaComponentRootComputation.get();
      });

      return [componentViewTree];
    }

    throw new Error('Invalid Component Template');
  }

  compute() {
    if (!this.resolveComponentComputation) {
      this.resolveComponentComputation = computed(() => {
        const component = this.env.getByName(
          this.template.component.name,
          this.template.component.external
        ) as t.Component;

        if (!component) {
          return [
            new t.ErrorSystemView({
              error: `Component "${this.template.component.name}" not found`,
              key: this.key,
              template: this.template,
            }),
          ];
        }

        if (
          this.componentViewTreeComputation &&
          this.componentViewTreeComputation.component === component
        ) {
          return this.componentViewTreeComputation.computed.get();
        }

        this.componentViewTreeComputation = {
          component,
          computed: computed(() => this.computeViewTreeForComponent(component)),
        };

        return this.componentViewTreeComputation.computed.get();
      });
    }

    const componentView = this.resolveComponentComputation.get();

    if (this.rekaComponentRootComputation) {
      this.rekaComponentRootComputation.get();
    }

    return componentView;
  }
}
