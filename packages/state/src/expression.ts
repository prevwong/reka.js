import * as t from '@composite/types';
import { action } from 'mobx';
import deepEqual from 'fast-deep-equal';

import { Environment } from './environment';
import { Composite } from './state';

const ExternalGlobalExprOpts: WeakMap<
  t.ExternalGlobal,
  Record<string, any>
> = new WeakMap();

export const computeExpression = (
  expr: t.Any,
  composite: Composite,
  env: Environment
) => {
  if (expr instanceof t.BinaryExpression) {
    const left = computeExpression(expr.left, composite, env);
    const right = computeExpression(expr.right, composite, env);

    switch (expr.operator) {
      case '+': {
        return left + right;
      }
      case '-': {
        return left - right;
      }
      case '==': {
        return left == right;
      }
      case '!=': {
        return left != right;
      }
      case '>': {
        return left > right;
      }
      case '>=': {
        return left >= right;
      }
      case '<': {
        return left < right;
      }
      case '<=': {
        return left <= right;
      }
      default: {
        throw new Error(`Invalid binary operator "${expr.operator}"`);
      }
    }
  }

  if (expr instanceof t.ArrayExpression) {
    return expr.elements.map((el) => computeExpression(el, composite, env));
  }

  if (expr instanceof t.ObjectExpression) {
    return Object.keys(expr.properties).reduce(
      (accum, key) => ({
        ...accum,
        [key]: computeExpression(expr.properties[key], composite, env),
      }),
      {}
    );
  }

  if (expr instanceof t.MemberExpression) {
    const obj = computeExpression(expr.object, composite, env);
    return obj[expr.property.name];
  }

  if (expr instanceof t.Literal) {
    return expr.value;
  }

  if (expr instanceof t.Val) {
    env.set(expr.name, computeExpression(expr.init, composite, env));
    return;
  }

  if (expr instanceof t.Identifier) {
    return env.getByIdentifier(expr);
  }

  if (expr instanceof t.ExternalGlobal) {
    let opts: Record<string, any>;

    const newOpts = Object.keys(expr.params).reduce(
      (accum, key) => ({
        ...accum,
        [key]: computeExpression(expr.params[key], composite, env),
      }),
      {}
    );

    const existingOpts = ExternalGlobalExprOpts.get(expr);

    if (existingOpts && deepEqual(existingOpts, newOpts)) {
      opts = existingOpts;
    } else {
      opts = newOpts;
    }

    ExternalGlobalExprOpts.set(expr, opts);

    return composite.externals.globals[expr.name](opts);
  }

  if (expr instanceof t.Assignment) {
    const right = computeExpression(expr.right, composite, env);

    switch (expr.operator) {
      case '=': {
        return env.set(expr.left.name, right, true);
      }
      case '+=': {
        return env.set(
          expr.left.name,
          env.getByIdentifier(expr.left) + right,
          true
        );
      }
      case '-=': {
        return env.set(
          expr.left.name,
          env.getByIdentifier(expr.left) - right,
          true
        );
      }
    }
  }

  if (expr instanceof t.Block) {
    expr.statements.forEach((statement) => {
      computeExpression(statement, composite, env);
    });

    return;
  }

  if (expr instanceof t.Func) {
    const fn = action((...args) => {
      const blockEnv = env.inherit();

      expr.params.forEach((param, i) => {
        env.set(param.name, args[i]);
      });

      let returnValue;

      composite.change(() => {
        returnValue = computeExpression(expr.body, composite, blockEnv);
      });

      return returnValue;
    });

    fn['FuncNodeId'] = expr.id;

    return fn;
  }

  if (expr instanceof t.CallExpression) {
    composite.change(() => {
      const v = env.getByIdentifier(expr.identifier);

      v(...expr.arguments.map((arg) => computeExpression(arg, composite, env)));
    });
  }

  if (expr instanceof t.IfStatement) {
    const bool = computeExpression(expr.condition, composite, env);

    if (bool) {
      computeExpression(expr.consequent, composite, env);
    }
  }

  if (expr instanceof t.ConditionalExpression) {
    const bool = computeExpression(expr.condition, composite, env);

    if (bool) {
      return computeExpression(expr.consequent, composite, env);
    }

    return computeExpression(expr.alternate, composite, env);
  }
};
