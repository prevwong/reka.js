import * as t from '@rekajs/types';
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
    env.set(expr.name, computeExpression(expr.init, reka, env));
    return;
  }

  if (expr instanceof t.Identifier) {
    return env.getByIdentifier(expr);
  }

  if (expr instanceof t.ExternalGlobal) {
    const opts = Object.keys(expr.params).reduce(
      (accum, key) => ({
        ...accum,
        [key]: computeExpression(expr.params[key], reka, env),
      }),
      {}
    );

    return reka.externals.globals[expr.name](opts);
  }

  if (expr instanceof t.Assignment) {
    const right = computeExpression(expr.right, reka, env);

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
      computeExpression(statement, reka, env);
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

      reka.change(() => {
        returnValue = computeExpression(expr.body, reka, blockEnv);
      });

      return returnValue;
    });

    fn['FuncNodeId'] = expr.id;

    return fn;
  }

  if (expr instanceof t.CallExpression) {
    reka.change(() => {
      const fn = env.getByIdentifier(expr.identifier);

      fn(...expr.arguments.map((arg) => computeExpression(arg, reka, env)));
    });
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
