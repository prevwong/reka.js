import * as t from '@rekajs/types';
import { invariant } from '@rekajs/utils';
import { action } from 'mobx';

import { Environment } from './environment';
import { Reka } from './reka';

export const computeExpression = (
  expr: t.Any,
  reka: Reka,
  env: Environment
) => {
  if (expr instanceof t.BinaryExpression) {
    const left = computeExpression(expr.left, reka, env);
    const right = computeExpression(expr.right, reka, env);

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
    return expr.elements.map((el) => computeExpression(el, reka, env));
  }

  if (expr instanceof t.ObjectExpression) {
    return Object.keys(expr.properties).reduce(
      (accum, key) => ({
        ...accum,
        [key]: computeExpression(expr.properties[key], reka, env),
      }),
      {}
    );
  }

  if (expr instanceof t.MemberExpression) {
    const obj = computeExpression(expr.object, reka, env);
    return obj[expr.property.name];
  }

  if (expr instanceof t.Literal) {
    return expr.value;
  }

  if (expr instanceof t.Val) {
    env.set(expr.name, {
      value: computeExpression(expr.init, reka, env),
      readonly: false,
    });
    return;
  }

  if (expr instanceof t.Identifier) {
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
    const bool = computeExpression(expr.condition, reka, env);

    if (bool) {
      computeExpression(expr.consequent, reka, env);
    }
  }

  if (expr instanceof t.ConditionalExpression) {
    const bool = computeExpression(expr.condition, reka, env);

    if (bool) {
      return computeExpression(expr.consequent, reka, env);
    }

    return computeExpression(expr.alternate, reka, env);
  }
};
