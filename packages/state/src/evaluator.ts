import * as t from '@composite/types';
import {
  computed,
  IComputedValue,
  IObservableValue,
  observable,
  runInAction,
} from 'mobx';

import { ComponentViewEvaluator } from './component';
import { Environment } from './environment';
import { computeExpression } from './expression';
import { Frame } from './frame';
import { Observer } from './observer';
import { Composite } from './state';
import { createKey, isPrimitive, valueToHash } from './utils';

export type TemplateEvaluateContext = {
  env: Environment;
  path: string[];
  classList: string[];
};

export type TemplateViewComputationCache = {
  template: t.Template;
  computed: IComputedValue<t.View[]>;
};

export type TemplateEachComputationCache = {
  hash: string;
  computed: IComputedValue<t.View[]>;
  iteration: Map<
    string,
    {
      computed: IComputedValue<t.View>;
    }
  >;
};

export class ViewEvaluator {
  private declare rootObserver: Observer;
  private _root: IObservableValue<t.View | undefined>;
  private rootTemplate: t.ComponentTemplate;
  private rootTemplateObserver: Observer;

  private tplToView: WeakMap<t.Template, t.View[]> = new WeakMap();
  private tplToEachComputationCache: WeakMap<
    t.Template,
    TemplateEachComputationCache
  > = new WeakMap();
  private viewToParentView: WeakMap<t.View, t.ElementView> = new WeakMap();

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
    readonly composite: Composite
  ) {
    this._root = observable.box();

    this.rootTemplate = t.componentTemplate({
      component: t.identifier({ name: this.componentName }),
      props: this.componentProps,
      children: [],
    });

    this.rootTemplateObserver = new Observer(this.rootTemplate);
  }

  get root() {
    return this._root.get();
  }

  private diff(key: string, newView: t.View) {
    const existingView = this.tplKeyToView.get(key);

    if (!existingView) {
      this.tplKeyToView.set(key, newView);
      return newView;
    }

    return runInAction(() => {
      const mergedView = t.mergeType(existingView, newView, {
        function: (a, b) => {
          if (a['viewFn'] && b['viewFn']) {
            return a;
          }
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

  private setRoot(root: t.View) {
    if (this.rootObserver) {
      this.rootObserver.dispose();
    }

    this._root.set(root);

    this.rootObserver = new Observer(root, {
      hooks: {
        onDispose: (payload) => {
          const disposedType = payload.type;

          if (disposedType instanceof t.View && disposedType.key !== 'frame') {
            this.tplKeyToViewComputationCache.delete(disposedType.key);
            this.tplKeyToComponentEvaluator.delete(disposedType.key);
            this.tplKeyToView.delete(disposedType.key);
          }
        },
      },
    });
  }

  computeTemplate(template: t.Template, ctx: TemplateEvaluateContext) {
    ctx = {
      ...ctx,
      classList: [],
    };

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
        return existingTplComputationCache.computed.get();
      }

      const prevEachExpr = template.each;

      const computation = computed(
        () => {
          /**
           * If the each expr for the template has changed, return the existing view
           * A new view with the proper env values will be computed
           */
          if (prevEachExpr !== template.each && this.tplToView.get(template)) {
            return this.tplToView.get(template) as t.View[];
          }

          if (template.if) {
            const bool = this.computeExpr(template.if, ctx.env);

            if (!bool) {
              return [];
            }
          }

          const classList = template.classList;

          if (classList) {
            ctx.classList = Object.keys(classList.properties).reduce(
              (accum, key) => {
                const bool = this.computeExpr(
                  classList.properties[key],
                  ctx.env
                );
                if (bool) {
                  accum.push(key);
                }

                return accum;
              },
              [] as string[]
            );
          }

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
          keepAlive: true,
        }
      );

      this.tplKeyToViewComputationCache.set(key, {
        computed: computation,
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

    const eachExpr = template.each;

    const iteratorHash = `${template.id}-${eachExpr.iterator.id}`;

    const existingEachComputationCache =
      this.tplToEachComputationCache.get(template);

    if (
      existingEachComputationCache &&
      existingEachComputationCache.hash === iteratorHash
    ) {
      return existingEachComputationCache.computed.get();
    }

    const iteration = new Map();

    const tplEnv = ctx.env.inherit();

    const eachComputation = computed(() => {
      const iterator = tplEnv.getByIdentifier(eachExpr.iterator);

      const views: t.View[] = [];

      const iterationValueHashes = new Set();

      for (let i = 0; i < iterator.length; i++) {
        const value = iterator[i];
        let iteratorValueHash = `${iteratorHash}.${valueToHash(value)}`;

        if (isPrimitive(value)) {
          iteratorValueHash = `${iteratorValueHash}.${i}`;
        }

        iterationValueHashes.add(iteratorValueHash);

        let iteratorCache = iteration.get(iteratorValueHash);

        if (!iteratorCache) {
          const inheritedEnv = tplEnv.clone();

          iteratorCache = {
            computed: computed(() => {
              inheritedEnv.set(eachExpr.alias.name, value);

              if (eachExpr.index) {
                inheritedEnv.set(eachExpr.index.name, i);
              }

              return renderTemplate(template, {
                ...ctx,
                path: [...ctx.path, iteratorValueHash],
                env: inheritedEnv,
              })[0];
            }),
          };

          iteration.set(iteratorValueHash, iteratorCache);
        }

        const view = iteratorCache.computed.get();

        if (view) {
          views.push(view);
        }
      }

      for (const k of iteration.keys()) {
        if (iterationValueHashes.has(k)) {
          continue;
        }

        iteration.delete(k);
      }

      return views;
    });

    this.tplToEachComputationCache.set(template, {
      hash: iteratorHash,
      computed: eachComputation,
      iteration: new Map(),
    });

    return eachComputation.get();
  }

  computeSlotTemplate(template: t.SlotTemplate, ctx: TemplateEvaluateContext) {
    return [
      t.slotView({
        key: createKey(ctx.path),
        template,
        view: ctx.env.getByName('$$children'),
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
      const props = Object.keys(template.props).reduce((accum, key) => {
        const value = this.computeExpr(template.props[key], ctx.env);

        return {
          ...accum,
          [key]: value,
        };
      }, {});

      if (ctx.classList.length > 0) {
        props['className'] = [props['className'], ...ctx.classList]
          .filter(Boolean)
          .join(' ');
      }

      view = t.elementView({
        tag: template.tag,
        children,
        props,
        key: createKey(ctx.path),
        template,
      });
    } catch (error: any) {
      console.warn('view error', template, error, ctx);
      view = new t.ErrorSystemView({
        key: createKey(ctx.path),
        error: `Something went wrong, was unable to compute View.`,
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
      const componentEnv = this.composite.env.inherit();

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
    return computeExpression(expr, this.composite, env);
  }

  computeTree() {
    const _compute = () => {
      // TODO: if root element has @each, this only renders the first @each iteration
      // We need to render the root view with a Fragment
      const view = this.computeTemplate(this.rootTemplate, {
        path: ['frame'],
        env: this.composite.env,
        classList: [],
      })[0];

      if (this.root !== view) {
        this.setRoot(view);
      } else {
        this.tplKeyToComponentEvaluator.forEach((componentEvaluator) => {
          componentEvaluator.compute();
        });
      }

      return view;
    };

    if (!this.rootObserver) {
      _compute();
      return;
    }

    this.rootObserver.change(
      () => {
        _compute();
      },
      {
        batch: false,
      }
    );
  }

  dispose() {
    this.rootTemplateObserver.dispose();
    this.rootObserver.dispose();

    this.tplToView = new Map();
    this.tplToEachComputationCache = new WeakMap();
    this.viewToParentView = new WeakMap();

    this.tplKeyToViewComputationCache = new Map();
    this.tplKeyToComponentEvaluator = new Map();
    this.tplKeyToView = new Map();
  }

  setProps(props: Record<string, any>) {
    runInAction(() => {
      this.rootTemplate.props = props;
    });

    this.computeTree();
  }
}