import * as t from '@composite/types';
import { action } from 'mobx';

import { Environment } from './environment';
import { State } from './state';

export const computeExpression = (
  expr: t.Any,
  state: State,
  env: Environment
) => {
  if (expr instanceof t.BinaryExpression) {
    const left = computeExpression(expr.left, state, env);
    const right = computeExpression(expr.right, state, env);

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
      default: {
        throw new Error(`Invalid binary operator "${expr.operator}"`);
      }
    }
  }

  if (expr instanceof t.ArrayExpression) {
    return expr.elements.map((el) => computeExpression(el, state, env));
  }

  if (expr instanceof t.ObjectExpression) {
    return Object.keys(expr.properties).reduce(
      (accum, key) => ({
        ...accum,
        [key]: computeExpression(expr.properties[key], state, env),
      }),
      {}
    );
  }

  if (expr instanceof t.MemberExpression) {
    const obj = computeExpression(expr.object, state, env);
    return obj[expr.property.name];
  }

  if (expr instanceof t.Literal) {
    return expr.value;
  }

  if (expr instanceof t.Val) {
    env.set(expr.name, computeExpression(expr.init, state, env));
    return;
  }

  if (expr instanceof t.Identifier) {
    return env.getByIdentifier(expr);
  }

  if (expr instanceof t.Assignment) {
    const right = computeExpression(expr.right, state, env);

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
      computeExpression(statement, state, env);
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

      state.change(() => {
        returnValue = computeExpression(expr.body, state, blockEnv);
      });

      return returnValue;
    });

    fn['viewFn'] = true;

    return fn;
  }
};
