import * as t from '@rekajs/types';
import { invariant } from '@rekajs/utils';
import { action, untracked } from 'mobx';

import { Environment } from './environment';
import { Reka } from './reka';

type ExprContext = {
  untrackIdentifier: boolean;
};

const DEFAULT_EXPR_CONTEXT: ExprContext = {
  untrackIdentifier: false,
};

export const computeExpression = (
  expr: t.Any,
  reka: Reka,
  env: Environment,
  ctx: ExprContext = DEFAULT_EXPR_CONTEXT
) => {
  if (expr instanceof t.BinaryExpression) {
    const left = computeExpression(expr.left, reka, env, ctx);
    const right = computeExpression(expr.right, reka, env, ctx);

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
    return expr.elements.map((el) => computeExpression(el, reka, env, ctx));
  }

  if (expr instanceof t.ObjectExpression) {
    return Object.keys(expr.properties).reduce(
      (accum, key) => ({
        ...accum,
        [key]: computeExpression(expr.properties[key], reka, env, ctx),
      }),
      {}
    );
  }

  if (expr instanceof t.MemberExpression) {
    const obj = computeExpression(expr.object, reka, env, ctx);
    return obj[expr.property.name];
  }

  if (expr instanceof t.Literal) {
    return expr.value;
  }

  if (expr instanceof t.Val) {
    const value = computeExpression(expr.init, reka, env, {
      ...ctx,
      untrackIdentifier: true,
    });

    env.set(expr.name, {
      value,
      readonly: false,
    });
    return;
  }

  if (expr instanceof t.Identifier) {
    if (ctx.untrackIdentifier) {
      return untracked(() => {
        return env.getByIdentifier(expr);
      });
    }

    return env.getByIdentifier(expr);
  }

  if (expr instanceof t.Assignment) {
    invariant(!expr.left.external, 'Cannot reassign external value');

    const right = computeExpression(expr.right, reka, env);

    switch (expr.operator) {
      case '=': {
        return env.reassign(expr.left, right);
      }
      case '+=': {
        return env.reassign(expr.left, env.getByIdentifier(expr.left) + right);
      }
      case '-=': {
        return env.reassign(expr.left, env.getByIdentifier(expr.left) - right);
      }
    }
  }

  if (expr instanceof t.Block) {
    expr.statements.forEach((statement) => {
      computeExpression(statement, reka, env);
    });

    return;
  }

  if (expr instanceof t.Func) {
    const fn = action((...args: any[]) => {
      const blockEnv = env.inherit();

      expr.params.forEach((param, i) => {
        env.set(param.name, { value: args[i], readonly: true });
      });

      let returnValue: any;

      reka.change(() => {
        try {
          returnValue = computeExpression(expr.body, reka, blockEnv);
        } catch (err) {
          // TODO: create a error handling system
          console.warn(err);
        }
      });

      return returnValue;
    });

    fn['FuncNodeId'] = expr.id;

    return fn;
  }

  if (expr instanceof t.CallExpression) {
    const fn = env.getByIdentifier(expr.identifier);

    const params = Object.keys(expr.params).reduce(
      (accum, key) => ({
        ...accum,
        [key]: computeExpression(expr.params[key], reka, env),
      }),
      {}
    );

    return fn(params);
  }

  if (expr instanceof t.IfStatement) {
    const bool = computeExpression(expr.condition, reka, env, ctx);

    if (bool) {
      computeExpression(expr.consequent, reka, env, ctx);
    }
  }

  if (expr instanceof t.ConditionalExpression) {
    const bool = computeExpression(expr.condition, reka, env, ctx);

    if (bool) {
      return computeExpression(expr.consequent, reka, env, ctx);
    }

    return computeExpression(expr.alternate, reka, env, ctx);
  }
};
