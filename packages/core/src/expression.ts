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

const getPathFromMemberExpression = (
  expr: t.MemberExpression,
  reka: Reka,
  env: Environment,
  ctx: ExprContext
) => {
  if (t.is(expr.object, t.Identifier)) {
    return [expr.object.name, computeExpression(expr.property, reka, env, ctx)];
  }

  return [
    ...getPathFromMemberExpression(expr.object, reka, env, ctx),
    computeExpression(expr.property, reka, env, ctx),
  ];
};

const assertNonExternalIdentifier = (identifier: t.Identifier) => {
  invariant(!identifier.external, 'Cannot reassign external value');
};

const updateLocalValue = (
  target: t.Identifier | t.MemberExpression,
  reka: Reka,
  env: Environment,
  ctx: ExprContext,
  updater: (currentValue: any) => any
) => {
  const currentValue = computeExpression(target, reka, env, {
    untrackIdentifier: true,
  });

  const newValue = updater(currentValue);

  if (t.is(target, t.Identifier)) {
    assertNonExternalIdentifier(target);
    env.reassign(target, newValue);
    return;
  }

  const rootIdentifier = t.getRootIdentifierInMemberExpression(target);
  assertNonExternalIdentifier(rootIdentifier);

  const baseValue = computeExpression(rootIdentifier, reka, env, {
    untrackIdentifier: true,
  });

  const path = getPathFromMemberExpression(target, reka, env, ctx);

  let targetValue = baseValue;

  for (let i = 1; i < path.length - 1; i++) {
    targetValue = targetValue[path[i]];
  }

  targetValue[path[path.length - 1]] = newValue;

  env.reassign(rootIdentifier, baseValue);
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

    const operator = expr.operator;

    switch (operator) {
      case '+': {
        return left + right;
      }
      case '-': {
        return left - right;
      }
      case '*': {
        return left * right;
      }
      case '/': {
        return left / right;
      }
      case '^': {
        return Math.pow(left, right);
      }
      case '%': {
        return left % right;
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
      case '||': {
        return left || right;
      }
      case '&&': {
        return left && right;
      }
      case '??': {
        return left ?? right;
      }
      default: {
        throw new Error(`Invalid binary operator "${operator}"`);
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
    const rootIdentifier = t.getRootIdentifierInMemberExpression(expr);
    const obj = computeExpression(rootIdentifier, reka, env, ctx);
    const path = getPathFromMemberExpression(expr, reka, env, ctx);
    let target = obj;

    for (let i = 1; i < path.length; i++) {
      target = target[path[i]];
    }

    return target;
  }

  if (expr instanceof t.Literal) {
    return expr.value;
  }

  if (expr instanceof t.Val) {
    const value = expr.init
      ? computeExpression(expr.init, reka, env, {
          ...ctx,
          untrackIdentifier: true,
        })
      : null;

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
    const right = computeExpression(expr.right, reka, env);

    updateLocalValue(expr.left, reka, env, ctx, (current) => {
      switch (expr.operator) {
        case '=': {
          return right;
        }
        case '+=': {
          return current + right;
        }
        case '-=': {
          return current - right;
        }
        case '*=': {
          return current * right;
        }
        case '/=': {
          return current / right;
        }
        case '^=': {
          return Math.pow(current, right);
        }
        case '%=': {
          return current % right;
        }
      }
    });
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

    const args = expr.arguments.map((arg) => computeExpression(arg, reka, env));

    return fn(...args);
  }

  if (expr instanceof t.UnaryExpression) {
    const value = computeExpression(expr.argument, reka, env);

    if (expr.operator === '-') {
      return -value;
    }

    throw new Error(`Unknown unary operator: ${expr.operator}`);
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
