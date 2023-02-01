import { invariant } from './error';

export const safeObjKey = (key: string) => {
  const match = key.match(/(?:")?(.+)(?:")?/);

  invariant(match, 'Invalid object key');

  return match[1];
};
