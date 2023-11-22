import { invariant } from './error';

export const safeObjKey = (key: string) => {
  const match = key.match(/(?:")?(.+)(?:")?/);

  invariant(match, 'Invalid object key');

  return match[1];
};

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.substring(1);

export const omit = <R extends Record<string, any>, K extends keyof R>(
  obj: R,
  keys: Array<K> | ReadonlyArray<K>
) => {
  return Object.keys(obj).reduce((accum, key) => {
    if (!(keys as string[]).includes(key)) {
      accum[key] = obj[key];
    }

    return accum;
  }, {} as Record<string, any>) as Omit<R, K>;
};
