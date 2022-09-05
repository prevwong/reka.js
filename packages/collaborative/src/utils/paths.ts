import * as t from '@composite/types';

/**
 * Given a Mobx change path
 * Return the path of the inner most Type
 */
export const getTypePathFromMobxChangePath = (path) => {
  const traversePath = (path, res) => {
    const curr = path.pop();

    if (curr.parent instanceof t.Type) {
      return [curr.parent, curr.key, ...res];
    }

    return traversePath(path, [curr.key, ...res]);
  };

  return traversePath(path, []);
};
