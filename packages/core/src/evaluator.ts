import * as t from '@rekajs/types';
import { invariant, safeObjKey, omit } from '@rekajs/utils';
import {
  computed,
  IComputedValue,
  IObservableValue,
  isObservable,
  makeObservable,
  observable,
  runInAction,
  untracked,
} from 'mobx';

import { ComponentViewEvaluator } from './component';
import { DisposableComputation } from './computation';
import { EachDirectiveEvaluator } from './each';
import { Environment } from './environment';
import { computeExpression } from './expression';
import { Frame } from './frame';
import { Observer, ChangesetListener } from './observer';
import { Reka } from './reka';
import { ClassListBindingKey, ComponentSlotBindingKey } from './symbols';
import { createKey } from './utils';

export type TemplateEvaluateContext = {
  env: Environment;
  owner: t.ComponentView | null;
  path: string[];
  componentStack: t.Component[];
};

export type TemplateViewComputationCache = {
  template: t.Template;
  computation: IComputedValue<t.View[]>;
};

export type TemplateEachComputationCache = {
  evaluator: EachDirectiveEvaluator;
};

export class Evaluator {
  private _view: IObservableValue<t.FrameView | undefined>;

  private viewObserver: Observer | undefined;
  private rootTemplate: t.ComponentTemplate;
  private rootTemplateObserver: Observer;
  private declare rootTemplateComputation: DisposableComputation<t.View[]>;

  tplToView: Map<t.Template, t.View[]> = new Map();
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

  _component: IObservableValue<t.Component | null>;

  constructor(
    readonly frame: Frame,
    readonly componentName: string,
    readonly componentProps: Record<string, any>,
    readonly reka: Reka,
    readonly external = false
  ) {
    this._view = observable.box();
    this._component = observable.box(null);

    const nonChildrenProps = omit(this.componentProps, ['children']);

    let children = this.componentProps['children'];

    if (children) {
      children = Array.isArray(children) ? children : [children];
    }

    this.rootTemplate = t.componentTemplate({
      component: t.identifier({
        name: this.componentName,
        external: this.external,
      }),
      props: nonChildrenProps,
      children: children || [],
    });

    this.rootTemplateObserver = new Observer(this.rootTemplate, {
      id: `evaluator.${this.componentName}.${this.rootTemplate.id}`,
    });

    makeObservable(this, {
      tplToView: observable,
    });

    this.setView(
      t.frameView({
        children: [],
        owner: null,
        template: this.rootTemplate,
        frame: this.frame.id,
        key: 'frame',
      })
    );
  }

  get view() {
    return this._view.get()!;
  }

  get component() {
    return this._component.get();
  }

  getViewsForTpl(tpl: t.Template) {
    return this.tplToView.get(tpl) ?? [];
  }

  getViewFromId<T extends t.Type = t.Any>(
    id: string,
    expectedType?: t.TypeConstructor<T>
  ) {
    invariant(
      this.viewObserver,
      'View not initialised, run .computeTree() first'
    );
    return this.viewObserver.getTypeFromId(id, expectedType);
  }

  getParentView<T extends t.View>(
    view: t.View,
    expectedParentType?: t.TypeConstructor<T>
  ) {
    return this.viewObserver?.getParentNode(view, expectedParentType) ?? null;
  }

  private disposeComponentEvaluators() {
    this.tplKeyToComponentEvaluator.forEach((componentEvaluator) => {
      componentEvaluator.dispose();
    });
  }

  private changeRootTemplate(cb: () => void) {
    return this.rootTemplateObserver.change(cb);
  }

  diff(key: string, newView: t.View) {
    const existingView = this.tplKeyToView.get(key);

    if (!existingView || !this.viewObserver) {
      this.tplKeyToView.set(key, newView);
      return newView;
    }

    const observer = this.viewObserver;

    invariant(observer, 'Root observer not initialiased');

    return observer.change(() => {
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
            exclude: ['template', 'owner'],
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

      parent.children.splice(index, 0, newView);

      return newView;
    });
  }

  private setView(view: t.FrameView) {
    runInAction(() => {
      if (this.viewObserver) {
        this.viewObserver.dispose();
      }
      this._view.set(view);

      this.viewObserver = new Observer(view, {
        id: `view-${this.rootTemplate.id}`,
        shouldIgnoreObservable: (_, key, value) => {
          if (key === 'owner') {
            return true;
          }

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

  listenToChangeset(listener: ChangesetListener) {
    const observer = this.viewObserver;

    invariant(
      observer,
      `Observer for the view tree not initialised. Have you called frame.evaluate()?`
    );

    return observer.listenToChangeset(listener);
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

          let viewSet: t.View[] = [];

          if (template instanceof t.TagTemplate) {
            viewSet = this.computeTagTemplate(template, ctx);
          }

          if (template instanceof t.ComponentTemplate) {
            viewSet = this.computeComponentTemplate(template, ctx);
          }

          if (template instanceof t.SlotTemplate) {
            viewSet = this.computeSlotTemplate(template, ctx);
          }

          if (template instanceof t.FragmentTemplate) {
            viewSet = this.computeFragmentTemplate(template, ctx);
          }

          const cachedViewSet = viewSet.map((view) => {
            const cachedView = this.diff(view.key, view);

            if (t.is(view, t.SlottableView)) {
              view.children.forEach((child) => {
                this.viewToParentView.set(child, cachedView);
              });
            }

            return cachedView;
          });

          this.tplToView.set(template, cachedViewSet);

          return cachedViewSet;
        },
        {
          name: `template-${template.id}<${key}>-root-evaluation`,
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

  computeFragmentTemplate(
    template: t.FragmentTemplate,
    ctx: TemplateEvaluateContext
  ) {
    return [
      t.fragmentView({
        key: createKey(ctx.path),
        template,
        children: template.children.flatMap((child) =>
          this.computeTemplate(child, {
            ...ctx,
            path: [...ctx.path, child.id],
          })
        ),
        frame: this.frame.id,
        owner: ctx.owner,
      }),
    ];
  }

  computeSlotTemplate(template: t.SlotTemplate, ctx: TemplateEvaluateContext) {
    return [
      t.slotView({
        key: createKey(ctx.path),
        template,
        children: ctx.env.getByName(ComponentSlotBindingKey),
        frame: this.frame.id,
        owner: ctx.owner,
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
        const prop = template.props[key];

        let value: any;

        if (t.is(prop, t.PropBinding)) {
          value = this.computeExpr(prop.identifier, ctx.env);
        } else {
          value = this.computeExpr(prop, ctx.env);
        }

        return {
          ...accum,
          [key]: value,
        };
      }, {});

      const propBindings = Object.keys(template.props).reduce((accum, key) => {
        const prop = template.props[key];

        if (!t.is(prop, t.PropBinding)) {
          return accum;
        }

        return {
          ...accum,
          [key]: this.computeExpr(prop, ctx.env),
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
        bindings: propBindings,
        key: createKey(ctx.path),
        template,
        frame: this.frame.id,
        owner: ctx.owner,
      });
    } catch (error: any) {
      // TODO: create error handling system
      console.warn('view error', template, error, ctx);
      view = new t.ErrorSystemView({
        key: createKey(ctx.path),
        error: String(error),
        template,
        frame: this.frame.id,
        owner: ctx.owner,
      });
    }

    return [view];
  }

  computeComponentTemplate(
    template: t.ComponentTemplate,
    ctx: TemplateEvaluateContext
  ) {
    const key = createKey(ctx.path);
    const componentKey = createKey([key, 'component']);

    let componentEvaluator = this.tplKeyToComponentEvaluator.get(componentKey);

    const component = ctx.env.getByName(
      template.component.name,
      template.component.external
    ) as t.Component;

    if (ctx.path.length === 1 && ctx.path[0] === 'frame') {
      runInAction(() => {
        this._component.set(component);
      });
    }

    if (!component) {
      componentEvaluator?.dispose();

      return [
        t.errorSystemView({
          frame: this.frame.id,
          error: `Component "${template.component.name}" not found`,
          key,
          template: template,
          owner: ctx.owner,
        }),
      ];
    }

    if (ctx.componentStack.indexOf(component) > -1) {
      componentEvaluator?.dispose();

      return [
        t.errorSystemView({
          frame: this.frame.id,
          error: `Cycle detected when attempting to render "${component.name}"`,
          key,
          template: template,
          owner: ctx.owner,
        }),
      ];
    }

    if (!componentEvaluator || componentEvaluator.component !== component) {
      const componentEnv = this.reka.head.env.inherit();

      componentEvaluator = new ComponentViewEvaluator(
        this,
        {
          ...ctx,
          path: [...ctx.path, 'component'],
        },
        template,
        componentEnv,
        component
      );

      this.tplKeyToComponentEvaluator.set(componentKey, componentEvaluator);
    }

    return untracked(() => componentEvaluator!.compute());
  }

  computeExpr(expr: t.Any, env: Environment) {
    return computeExpression(expr, this.reka, env);
  }

  computeRootTemplate() {
    if (this.rootTemplateComputation) {
      return this.rootTemplateComputation.get();
    }

    this.rootTemplateComputation = new DisposableComputation(
      () =>
        this.computeTemplate(this.rootTemplate, {
          path: ['frame', 'root'],
          env: this.reka.head.env,
          owner: null,
          componentStack: [],
        }),
      {
        keepAlive: true,
      }
    );

    return this.rootTemplateComputation.get();
  }

  computeView() {
    if (!this.reka.loaded) {
      return;
    }

    const viewObserver = this.viewObserver;

    invariant(viewObserver);

    const views = this.computeRootTemplate();

    viewObserver.change(() => {
      for (let i = 0; i < views.length; i++) {
        if (
          this.view.children.length > i &&
          this.view.children[i] === views[i]
        ) {
          continue;
        }

        this.view.children[i] = views[i];
      }

      this.tplKeyToComponentEvaluator.forEach((componentEvaluator) => {
        componentEvaluator.compute();
      });
    });
  }

  dispose() {
    if (this.viewObserver) {
      this.viewObserver.dispose();
    }

    if (this.rootTemplateComputation) {
      this.rootTemplateComputation.dispose();
    }

    this.rootTemplateObserver.dispose();
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

    this.computeView();
  }
}
