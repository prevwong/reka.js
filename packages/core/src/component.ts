import * as t from '@rekajs/types';
import { computed, IComputedValue, runInAction, untracked } from 'mobx';

import { DisposableComputation } from './computation';
import { Environment } from './environment';
import { TemplateEvaluateContext, Evaluator } from './evaluator';
import { ClassListBindingKey, ComponentSlotBindingKey } from './symbols';
import { createKey } from './utils';

type ComponentViewTreeComputationCache = {
  component: t.Component;
  computed: IComputedValue<t.RekaComponentView[] | t.ExternalComponentView[]>;
};

export class ComponentViewEvaluator {
  private declare resolveComponentComputation: IComputedValue<
    t.RekaComponentView[] | t.ErrorSystemView[] | t.ExternalComponentView[]
  >;
  private declare componentViewTreeComputation: ComponentViewTreeComputationCache | null;

  private declare rekaComponentRootComputation: DisposableComputation<t.View> | null;
  private declare rekaComponentPropsComputation: IComputedValue<void> | null;
  private declare rekaComponentPropsBindingComputation: IComputedValue<void> | null;
  private declare rekaComponentStateComputation: IComputedValue<void> | null;

  private readonly evaluator: Evaluator;
  private readonly ctx: TemplateEvaluateContext;
  private readonly template: t.ComponentTemplate;

  private readonly env: Environment;

  readonly key: string;

  constructor(
    evaluator: Evaluator,
    ctx: TemplateEvaluateContext,
    template: t.ComponentTemplate,
    env: Environment
  ) {
    this.evaluator = evaluator;
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

      const children = this.template.children.flatMap((child) =>
        this.evaluator.computeTemplate(child, {
          ...this.ctx,
          path: [...this.ctx.path, child.id],
          owner: this.ctx.owner,
          componentStack: [...this.ctx.componentStack, component],
        })
      );

      return [
        t.externalComponentView({
          frame: this.evaluator.frame.id,
          component,
          key: this.key,
          template: this.template,
          children: children || [],
          props: Object.keys(this.template.props).reduce(
            (accum, key) => ({
              ...accum,
              [key]: this.evaluator.computeExpr(
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
        frame: this.evaluator.frame.id,
        key: this.key,
        component,
        render: [],
        template: this.template,
        owner: this.ctx.owner,
      });

      untracked(() => {
        if (this.rekaComponentRootComputation) {
          return this.rekaComponentRootComputation.get();
        }

        this.rekaComponentRootComputation = new DisposableComputation(
          () => {
            let render: t.View[] = [];
            if (!this.rekaComponentPropsComputation) {
              this.rekaComponentPropsComputation = computed(
                () => {
                  const slot = this.template.children.flatMap((child) =>
                    this.evaluator.computeTemplate(child, {
                      ...this.ctx,
                      path: [...this.ctx.path, child.id],
                      owner: this.ctx.owner,
                    })
                  );

                  this.env.set(ComponentSlotBindingKey, {
                    value: slot,
                    readonly: true,
                  });

                  component.props.forEach((prop) => {
                    let propValue: any;

                    const tplPropValue = this.template.props[prop.name];

                    if (tplPropValue) {
                      let expr = tplPropValue;

                      if (t.is(tplPropValue, t.PropBinding)) {
                        expr = tplPropValue.identifier;
                      }

                      propValue = this.evaluator.computeExpr(
                        expr,
                        this.ctx.env
                      );
                    }

                    if (!propValue && prop.init) {
                      propValue = this.evaluator.computeExpr(
                        prop.init,
                        this.ctx.env
                      );
                    }

                    const classListBinding =
                      this.ctx.env.getByName(ClassListBindingKey);

                    if (
                      prop.name === 'className' &&
                      classListBinding &&
                      Object.keys(classListBinding).length > 0
                    ) {
                      propValue = [propValue, ...classListBinding]
                        .filter(Boolean)
                        .join(' ');
                    }

                    this.env.set(prop.name, {
                      value: propValue,
                      readonly: false,
                    });
                  });
                },
                {
                  name: `component-${this.template.component.name}<${this.template.id}>-props-evaluation`,
                }
              );
            }

            if (!this.rekaComponentPropsBindingComputation) {
              this.rekaComponentPropsBindingComputation = computed(() => {
                for (const [prop, value] of Object.entries(
                  this.template.props
                )) {
                  if (!t.is(value, t.PropBinding)) {
                    continue;
                  }

                  const currPropValue = this.env.getByName(prop, false, true);

                  this.evaluator.reka.change(() => {
                    this.ctx.env.reassign(
                      t.assert(value, t.PropBinding).identifier,
                      currPropValue
                    );
                  });
                }
              });
            }

            if (!this.rekaComponentStateComputation) {
              this.rekaComponentStateComputation = computed(() => {
                component.state.forEach((val) => {
                  this.evaluator.computeExpr(val, this.env);
                });
              });
            }

            try {
              this.rekaComponentPropsComputation.get();
              this.rekaComponentPropsBindingComputation.get();
              this.rekaComponentStateComputation.get();

              render = this.evaluator.computeTemplate(component.template, {
                path: [this.key, 'root'],
                env: this.env,
                owner: componentViewTree,
                componentStack: [...this.ctx.componentStack, component],
              });
            } catch (err) {
              render = [
                t.errorSystemView({
                  frame: this.evaluator.frame.id,
                  error: String(err),
                  template: this.template,
                  key: this.key,
                  owner: componentViewTree,
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
          },
          {
            name: `component-${this.template.component.name}<${this.template.id}>-reka-root-computation`,
            keepAlive: true,
          }
        );

        return this.rekaComponentRootComputation.get();
      });

      return [componentViewTree];
    }

    throw new Error('Invalid Component Template');
  }

  recompute() {
    if (this.rekaComponentRootComputation) {
      this.rekaComponentRootComputation.get();

      return;
    }

    this.compute();
  }

  compute() {
    if (!this.resolveComponentComputation) {
      this.resolveComponentComputation = computed(
        () => {
          const component = this.env.getByName(
            this.template.component.name,
            this.template.component.external
          ) as t.Component;

          if (!component) {
            this.componentViewTreeComputation = null;

            return [
              t.errorSystemView({
                frame: this.evaluator.frame.id,
                error: `Component "${this.template.component.name}" not found`,
                key: this.key,
                template: this.template,
                owner: this.ctx.owner,
              }),
            ];
          }

          if (this.ctx.componentStack.indexOf(component) > -1) {
            return [
              t.errorSystemView({
                frame: this.evaluator.frame.id,
                error: `Cycle detected when attempting to render "${component.name}"`,
                key: this.key,
                template: this.template,
                owner: this.ctx.owner,
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
            computed: computed(
              () => this.computeViewTreeForComponent(component),
              {
                name: `component-${this.template.component.name}<${this.template.id}>-resolved-view-computation`,
              }
            ),
          };

          return this.componentViewTreeComputation.computed.get();
        },
        {
          name: `component-${this.template.component.name}<${this.template.id}>-resolve-computation`,
        }
      );
    }

    return this.resolveComponentComputation.get();
  }

  dispose() {
    if (!this.rekaComponentRootComputation) {
      return;
    }

    this.rekaComponentRootComputation.dispose();
  }
}
