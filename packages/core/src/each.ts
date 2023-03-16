import * as t from '@rekajs/types';
import { invariant } from '@rekajs/utils';
import { computed, IComputedValue, untracked } from 'mobx';

import { TemplateEvaluateContext, ViewEvaluator } from './evaluator';
import { isPrimitive, valueToHash } from './utils';

type EachItemCache = {
  head: IComputedValue<void>;
  template: IComputedValue<t.View>;
};

export class EachDirectiveEvaluator {
  id: string;

  items: Map<string, EachItemCache>;

  private eachExpr: t.ElementEach;
  private declare iteratorValueComputation: IComputedValue<t.View[]>;

  constructor(
    public readonly tree: ViewEvaluator,
    private readonly template: t.Template,
    private readonly ctx: TemplateEvaluateContext,
    private readonly renderTemplate: any
  ) {
    invariant(
      template.each,
      'EachDirectiveEvaluator expects a template with the each property speicifed'
    );

    this.eachExpr = template.each;
    this.id = template.each.iterator.id;

    this.items = new Map();
  }

  private computeIteratorItem(hash: string, value: any, i: number) {
    let item = this.items.get(hash);

    if (!item) {
      const inheritedEnv = untracked(() => this.ctx.env.clone());

      item = {
        head: computed(() => {
          inheritedEnv.set(this.eachExpr.alias.name, {
            value,
            readonly: true,
          });

          if (this.eachExpr.index) {
            inheritedEnv.set(this.eachExpr.index.name, {
              value: i,
              readonly: true,
            });
          }
        }),
        template: computed(() => {
          const tpl = this.renderTemplate(this.template, {
            ...this.ctx,
            path: [...this.ctx.path, this.eachExpr.id, hash],
            env: inheritedEnv,
          })[0];

          return tpl;
        }),
      };

      this.items.set(hash, item);
    }

    item.head.get();

    return item.template.get();
  }

  private computeIterator() {
    if (!this.iteratorValueComputation) {
      this.iteratorValueComputation = computed(() => {
        const views: t.View[] = [];
        const newItems = new Set();
        const iterator = this.tree.computeExpr(
          this.eachExpr.iterator,
          this.ctx.env
        );

        if (iterator) {
          for (let i = 0; i < iterator.length; i++) {
            const value = iterator[i];

            let itemHash = `${valueToHash(value)}`;

            if (isPrimitive(value)) {
              itemHash = `${itemHash}.${i}`;
            }

            newItems.add(itemHash);

            views[i] = this.computeIteratorItem(itemHash, value, i);
          }
        }

        for (const k of this.items.keys()) {
          if (newItems.has(k)) {
            continue;
          }

          this.items.delete(k);
        }

        return views;
      });
    }

    return this.iteratorValueComputation.get();
  }

  compute() {
    return this.computeIterator();
  }
}
