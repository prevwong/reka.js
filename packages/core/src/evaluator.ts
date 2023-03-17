import * as t from '@rekajs/types';
import { invariant, safeObjKey } from '@rekajs/utils';
import omit from 'lodash/omit';
import {
  computed,
  IComputedValue,
  IObservableValue,
  observable,
  runInAction,
  untracked,
} from 'mobx';

import { ComponentViewEvaluator } from './component';
import { EachDirectiveEvaluator } from './each';
import { Environment } from './environment';
import { computeExpression } from './expression';
import { Frame } from './frame';
import { Observer } from './observer';
import { Reka } from './reka';
import { ClassListBindingKey, ComponentSlotBindingKey } from './symbols';
import { createKey } from './utils';

export type TemplateEvaluateContext = {
  env: Environment;
  path: string[];
};

export type TemplateViewComputationCache = {
  template: t.Template;
  computation: IComputedValue<t.View[]>;
};

export type TemplateEachComputationCache = {
  evaluator: EachDirectiveEvaluator;
};

export class ViewEvaluator {
  private declare viewObserver: Observer;
  private _view: IObservableValue<t.RekaComponentView | undefined>;
  private rootTemplate: t.ComponentTemplate;
  private rootTemplateObserver: Observer;

  private tplToView: WeakMap<t.Template, t.View[]> = new WeakMap();
  private tplKeyToClassListComputationCache: Map<string, IComputedValue<void>> =
    new Map();
  private tplToEachComputationCache: WeakMap<
    t.Template,
    TemplateEachComputationCache
  > = new WeakMap();
  private viewToParentView: WeakMap<t.View, t.TagView> = new WeakMap();

  private tplKeyToViewComputationCache: Map<
    string,
    TemplateViewComputationCache
  > = new Map();
  private tplKeyToComponentEvaluator: Map<string, ComponentViewEvaluator> =
    new Map();
  private tplKeyToView: Map<string, t.View> = new Map();

  constructor(
    readonly frame: Frame,
    readonly componentName: string,
    readonly componentProps: Record<string, any>,
    readonly reka: Reka
  ) {
    this._view = observable.box();

    const nonChildrenProps = omit(this.componentProps, ['children']);

    let children = this.componentProps['children'];

    if (children) {
      children = Array.isArray(children) ? children : [children];
    }

    invariant(
      this.reka.components.program.find(
        (component) => component.name === componentName
      ),
      `Component ${componentName} not found in state`
    );

    this.rootTemplate = t.componentTemplate({
      component: t.identifier({ name: this.componentName }),
      props: nonChildrenProps,
      children: children || [],
    });

    this.rootTemplateObserver = new Observer(this.rootTemplate);
  }

  get view() {
    return this._view.get();
  }

  getViewFromId<T extends t.Type = t.Any>(
    id: string,
    expectedType?: t.TypeConstructor<T>
  ) {
    return this.viewObserver.getTypeFromId(id, expectedType);
  }

  private disposeComponentEvaluators() {
    this.tplKeyToComponentEvaluator.forEach((componentEvaluator) => {
      componentEvaluator.dispose();
    });
  }

  private changeRootTemplate(cb: () => void) {
    return this.rootTemplateObserver.change(cb);
  }

  private diff(key: string, newView: t.View) {
    const existingView = this.tplKeyToView.get(key);

    if (!existingView) {
      this.tplKeyToView.set(key, newView);
      return newView;
    }

    return runInAction(() => {
      const mergedView = t.merge(existingView, newView, {
        function: (a, b) => {
          // Compare Func AST node id
          // If they are not equal, return the newly evaluated function
          if (a['FuncNodeId'] !== b['FuncNodeId']) {
            return b;
          }

          return a;
        },
        types: {
          View: {
            exclude: ['template'],
            diff: (a, b) => {
              if (a.key !== b.key) {
                return b;
              }
            },
          },
          ComponentView: {
            exclude: ['component'],
          },
        },
      });

      if (mergedView === existingView) {
        return mergedView;
      }

      const parent = this.viewToParentView.get(existingView);

      if (!parent) {
        return newView;
      }

      const index = parent.children.indexOf(existingView);

      parent.children[index] = newView;

      return newView;
    });
  }

  private setView(view: t.RekaComponentView) {
    if (this.viewObserver) {
      this.viewObserver.dispose();
    }

    runInAction(() => {
      this._view.set(view);

      this.viewObserver = new Observer(view, {
        id: `view-${this.rootTemplate.id}`,
        shouldIgnoreObservable: (_, __, value) => {
          if (value instanceof t.Template || value instanceof t.Component) {
            return true;
          }

          return false;
        },
        hooks: {
          onDispose: (payload) => {
            const disposedType = payload.type;

            if (
              disposedType instanceof t.View &&
              disposedType.key !== 'frame'
            ) {
              const componentCache = this.tplKeyToComponentEvaluator.get(
                disposedType.key
              );

              if (componentCache) {
                componentCache.dispose();
              }

              this.tplKeyToClassListComputationCache.delete(disposedType.key);
              this.tplKeyToViewComputationCache.delete(disposedType.key);
              this.tplKeyToComponentEvaluator.delete(disposedType.key);
              this.tplKeyToView.delete(disposedType.key);
            }
          },
        },
      });
    });
  }

  computeTemplate(template: t.Template, ctx: TemplateEvaluateContext) {
    const baseKey = createKey(ctx.path);

    const renderTemplate = (
      template: t.Template,
      ctx: TemplateEvaluateContext
    ) => {
      const key = createKey(ctx.path);
      const existingTplComputationCache =
        this.tplKeyToViewComputationCache.get(key);

      if (
        existingTplComputationCache &&
        existingTplComputationCache.template === template
      ) {
        return existingTplComputationCache.computation.get();
      }

      const prevEachExpr = untracked(() => template.each);

      const computation = computed(
        () => {
          /**
           * If the each expr for the template has changed, return the existing view
           * A new view with the proper env values will be computed
           */
          untracked(() => {
            if (
              prevEachExpr !== template.each &&
              this.tplToView.get(template)
            ) {
              return this.tplToView.get(template) as t.View[];
            }
          });

          if (template.if) {
            const bool = this.computeExpr(template.if, ctx.env);

            if (!bool) {
              return [];
            }
          }

          let classListComputation =
            this.tplKeyToClassListComputationCache.get(key);

          if (!classListComputation) {
            classListComputation = computed(() => {
              const classList = template.classList;

              if (classList) {
                const classListValue = Object.keys(classList.properties).reduce(
                  (accum, key) => {
                    const bool = this.computeExpr(
                      classList.properties[key],
                      ctx.env
                    );

                    if (bool) {
                      accum.push(safeObjKey(key));
                    }

                    return accum;
                  },
                  [] as string[]
                );

                ctx.env.set(ClassListBindingKey, {
                  readonly: true,
                  value: classListValue,
                });
              } else {
                ctx.env.set(ClassListBindingKey, {
                  readonly: true,
                  value: {},
                });
              }
            });

            this.tplKeyToClassListComputationCache.set(
              key,
              classListComputation
            );
          }

          classListComputation.get();

          let view: t.View[] = [];

          if (template instanceof t.TagTemplate) {
            view = this.computeTagTemplate(template, ctx);
          }

          if (template instanceof t.ComponentTemplate) {
            view = this.computeComponentTemplate(template, ctx);
          }

          if (template instanceof t.SlotTemplate) {
            view = this.computeSlotTemplate(template, ctx);
          }

          this.tplToView.set(template, view);

          return view;
        },
        {
          name: `template-${template.id}<${key}>-root-evaluation`,
          keepAlive: true,
        }
      );

      this.tplKeyToViewComputationCache.set(key, {
        computation: computation,
        template,
      });

      return computation.get();
    };

    if (!template.each) {
      this.tplToEachComputationCache.delete(template);

      return renderTemplate(template, {
        ...ctx,
        env: ctx.env.inherit(),
      });
    }

    this.tplKeyToViewComputationCache.delete(baseKey);
    this.tplKeyToComponentEvaluator.delete(baseKey);

    let eachEvaluatorCache = this.tplToEachComputationCache.get(template);

    if (
      !eachEvaluatorCache ||
      eachEvaluatorCache.evaluator.id !== template.each.id
    ) {
      eachEvaluatorCache = {
        evaluator: new EachDirectiveEvaluator(
          this,
          template,
          {
            ...ctx,
            env: ctx.env.inherit(),
          },
          renderTemplate
        ),
      };

      this.tplToEachComputationCache.set(template, eachEvaluatorCache);
    }

    return eachEvaluatorCache.evaluator.compute();
  }

  computeSlotTemplate(template: t.SlotTemplate, ctx: TemplateEvaluateContext) {
    return [
      t.slotView({
        key: createKey(ctx.path),
        template,
        children: ctx.env.getByName(ComponentSlotBindingKey),
      }),
    ];
  }

  computeTagTemplate(template: t.TagTemplate, ctx: TemplateEvaluateContext) {
    const children = template.children.flatMap((child) =>
      this.computeTemplate(child, {
        ...ctx,
        path: [...ctx.path, child.id],
      })
    );

    let view: t.View;

    try {
      // TODO: currently props are re-evaluated any time a change occurs within the template tree
      // We should maybe cache the props evaluation as well
      const props = Object.keys(template.props).reduce((accum, key) => {
        const value = this.computeExpr(template.props[key], ctx.env);

        return {
          ...accum,
          [key]: value,
        };
      }, {});

      const classListBinding = ctx.env.getByName(ClassListBindingKey);

      if (classListBinding && Object.keys(classListBinding).length > 0) {
        props['className'] = [props['className'], ...classListBinding]
          .filter(Boolean)
          .join(' ');
      }

      view = t.tagView({
        tag: template.tag,
        children,
        props,
        key: createKey(ctx.path),
        template,
      });
    } catch (error: any) {
      // TODO: create error handling system
      console.warn('view error', template, error, ctx);
      view = new t.ErrorSystemView({
        key: createKey(ctx.path),
        error: String(error),
        template,
      });
    }

    const cachedView = this.diff(view.key, view);

    children.forEach((child) => {
      this.viewToParentView.set(child, cachedView);
    });

    return [cachedView];
  }

  computeComponentTemplate(
    template: t.ComponentTemplate,
    ctx: TemplateEvaluateContext
  ) {
    const key = createKey(ctx.path);

    let componentEvaluator = this.tplKeyToComponentEvaluator.get(key);

    if (!componentEvaluator) {
      const componentEnv = this.reka.head.env.inherit();

      componentEvaluator = new ComponentViewEvaluator(
        this,
        ctx,
        template,
        componentEnv
      );

      this.tplKeyToComponentEvaluator.set(key, componentEvaluator);
    }

    return componentEvaluator.compute();
  }

  computeExpr(expr: t.Any, env: Environment) {
    return computeExpression(expr, this.reka, env);
  }

  computeTree() {
    const _compute = () => {
      const views = this.computeTemplate(this.rootTemplate, {
        path: ['frame'],
        env: this.reka.head.env,
      });

      return t.assert(views[0], t.RekaComponentView);
    };

    if (!this.viewObserver) {
      this.setView(_compute());
      return;
    }

    this.viewObserver.change(() => {
      _compute();

      this.tplKeyToComponentEvaluator.forEach((componentEvaluator) => {
        componentEvaluator.recompute();
      });
    });
  }

  dispose() {
    this.rootTemplateObserver.dispose();
    this.viewObserver.dispose();
    this.disposeComponentEvaluators();

    this.tplKeyToComponentEvaluator = new Map();
    this.tplToView = new Map();
    this.tplToEachComputationCache = new WeakMap();
    this.viewToParentView = new WeakMap();
    this.tplKeyToViewComputationCache = new Map();
    this.tplKeyToView = new Map();
  }

  setProps(props: Record<string, any>) {
    this.changeRootTemplate(() => {
      this.rootTemplate.props = omit(props, ['children']);

      if (props['children']) {
        const children = Array.isArray(props['children'])
          ? props['children']
          : [props['children']];

        t.merge(this.rootTemplate.children, children);
      }
    });

    this.computeTree();
  }
}
