import * as t from '@rekajs/types';
import { invariant, capitalize } from '@rekajs/utils';
import { computed, IComputedValue, runInAction, untracked } from 'mobx';

import { DisposableComputation } from './computation';
import { Environment } from './environment';
import { TemplateEvaluateContext, Evaluator } from './evaluator';
import { ClassListBindingKey, ComponentSlotBindingKey } from './symbols';
import { createKey, noop } from './utils';

type ComponentViewTreeComputationCache = {
  component: t.Component;
  computed: IComputedValue<t.FragmentView>;
};

type ComponentViewEvaluatorHooks = {
  onComponentResolved: (
    component: t.Component | null,
    name: string,
    external: boolean
  ) => void;
};

export class ComponentViewEvaluator {
  private declare resolveComponentComputation: DisposableComputation<t.FragmentView>;
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

  private fragment: t.FragmentView;

  private hooks: ComponentViewEvaluatorHooks;

  constructor(
    evaluator: Evaluator,
    ctx: TemplateEvaluateContext,
    template: t.ComponentTemplate,
    env: Environment,
    hooks?: Partial<ComponentViewEvaluatorHooks>
  ) {
    this.evaluator = evaluator;
    this.ctx = ctx;
    this.template = template;
    this.key = createKey(this.ctx.path);
    this.hooks = {
      onComponentResolved: noop,
      ...(hooks ?? {}),
    };

    this.env = env;

    this.rekaComponentStateComputation = null;

    this.fragment = t.fragmentView({
      children: [],
      frame: this.evaluator.frame.id,
      key: this.key,
      template: this.template,
    });
  }

  private computeProps(component: t.Component) {
    invariant(
      component instanceof t.RekaComponent ||
        component instanceof t.ExternalComponent
    );

    return component.props.reduce((accum, prop) => {
      let propValue: any;

      const tplPropValue = this.template.props[prop.name];

      if (tplPropValue) {
        let expr = tplPropValue;

        if (t.is(tplPropValue, t.PropBinding)) {
          expr = tplPropValue.identifier;
        }

        propValue = this.evaluator.computeExpr(expr, this.ctx.env);
      }

      if (!propValue && prop.init) {
        propValue = this.evaluator.computeExpr(prop.init, this.ctx.env);
      }

      const classListBinding = this.ctx.env.getByName(ClassListBindingKey);

      if (
        prop.name === 'className' &&
        classListBinding &&
        Object.keys(classListBinding).length > 0
      ) {
        propValue = [propValue, ...classListBinding].filter(Boolean).join(' ');
      }

      accum.push([prop, propValue]);

      return accum;
    }, [] as Array<[t.ComponentProp, any]>);
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

      const props = this.computeProps(component).reduce(
        (accum, [prop, value]) => {
          accum.push([prop.name, value]);

          const tplPropValue = this.template.props[prop.name];

          /**
           * External components should expose a `on{Prop}Change` prop in order to
           * support 2 way bindings in Reka
           *
           * const Input = (props) => {
           *  return <input type="text" value={props.value} onChange={e => props.onValueChange(e.targetValue)} />
           * }
           *
           */
          if (t.is(tplPropValue, t.PropBinding) && prop.bindable) {
            accum.push([
              `on${capitalize(prop.name)}Change`,
              (updatedValue: any) => {
                this.evaluator.reka.change(() => {
                  this.ctx.env.reassign(tplPropValue.identifier, updatedValue);
                });
              },
            ]);
          }

          return accum;
        },
        [] as [string, any][]
      );

      runInAction(() => {
        this.fragment.children = [
          t.externalComponentView({
            frame: this.evaluator.frame.id,
            component,
            key: createKey([this.key, 'root']),
            template: this.template,
            children: children || [],
            props: Object.fromEntries(props),
          }),
        ];
      });

      return this.fragment;
    }

    if (component instanceof t.RekaComponent) {
      if (this.rekaComponentRootComputation) {
        this.rekaComponentRootComputation.get();
        return this.fragment;
      }

      const componentViewTree = t.rekaComponentView({
        frame: this.evaluator.frame.id,
        key: createKey([this.key, 'root']),
        component,
        render: [],
        template: this.template,
        owner: this.ctx.owner,
      });

      runInAction(() => {
        this.fragment.children = [componentViewTree];
      });

      untracked(() => {
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

                  this.computeProps(component).forEach(([prop, value]) => {
                    this.env.set(prop.name, {
                      value,
                      readonly: !prop.bindable,
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
                component.props.forEach((prop) => {
                  if (!prop.bindable) {
                    return;
                  }

                  const tplProPValue = this.template.props[prop.name];

                  if (!tplProPValue || !t.is(tplProPValue, t.PropBinding)) {
                    return;
                  }

                  const currPropValue = this.env.getByName(
                    prop.name,
                    false,
                    true
                  );

                  this.evaluator.reka.change(() => {
                    this.ctx.env.reassign(
                      t.assert(tplProPValue, t.PropBinding).identifier,
                      currPropValue
                    );
                  });
                });
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
                path: [this.key, 'root', 'render'],
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

      return this.fragment;
    }

    throw new Error('Invalid Component Template');
  }

  private reset() {
    if (this.rekaComponentRootComputation) {
      this.rekaComponentRootComputation.dispose();
    }

    this.componentViewTreeComputation = null;
    this.rekaComponentRootComputation = null;
    this.rekaComponentPropsComputation = null;
    this.rekaComponentPropsBindingComputation = null;
    this.rekaComponentStateComputation = null;
  }

  compute() {
    if (!this.resolveComponentComputation) {
      this.resolveComponentComputation = new DisposableComputation(
        () => {
          const component = this.env.getByName(
            this.template.component.name,
            this.template.component.external
          ) as t.Component;

          if (!component) {
            this.componentViewTreeComputation = null;
            this.reset();
            this.hooks.onComponentResolved(
              null,
              this.template.component.name,
              this.template.component.external
            );

            runInAction(() => {
              this.fragment.children = [
                t.errorSystemView({
                  frame: this.evaluator.frame.id,
                  error: `Component "${this.template.component.name}" not found`,
                  key: createKey([this.key, 'root']),
                  template: this.template,
                  owner: this.ctx.owner,
                }),
              ];
            });

            return this.fragment;
          }

          if (this.ctx.componentStack.indexOf(component) > -1) {
            this.reset();

            runInAction(() => {
              this.fragment.children = [
                t.errorSystemView({
                  frame: this.evaluator.frame.id,
                  error: `Cycle detected when attempting to render "${component.name}"`,
                  key: createKey([this.key, 'root']),
                  template: this.template,
                  owner: this.ctx.owner,
                }),
              ];
            });

            return this.fragment;
          }

          if (
            this.componentViewTreeComputation &&
            this.componentViewTreeComputation.component === component
          ) {
            return this.componentViewTreeComputation.computed.get();
          }

          this.reset();

          this.hooks.onComponentResolved(
            component,
            this.template.component.name,
            this.template.component.external
          );

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
          keepAlive: true,
        }
      );
    }

    this.resolveComponentComputation.get();

    if (this.rekaComponentRootComputation) {
      this.rekaComponentRootComputation.get();
    }

    return [this.fragment];
  }

  get view() {
    return this.fragment.children[0];
  }

  dispose() {
    if (this.resolveComponentComputation) {
      this.resolveComponentComputation.dispose();
    }

    if (this.rekaComponentRootComputation) {
      this.rekaComponentRootComputation.dispose();
    }
  }
}
