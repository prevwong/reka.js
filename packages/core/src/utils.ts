import * as t from '@rekajs/types';

export const randUint16 = () => {
  if (typeof window === 'undefined') {
    return Math.random();
  }

  return window.crypto.getRandomValues(new Uint16Array(1))[0];
};

export const isCapitalLetter = (c: string) => c === c.toUpperCase();

export const createKey = (arr: string[]) => arr.join('.');

const HASHED_OBJ = new WeakMap();

export const valueToHash = (value: any): string => {
  if (typeof value === 'object') {
    if (!HASHED_OBJ.get(value)) {
      HASHED_OBJ.set(value, randUint16());
    }

    return HASHED_OBJ.get(value);
  }

  return value;
};

export const isPrimitive = (value: any) => {
  return typeof value !== 'object';
};

export const defer = (fn: () => void) => {
  if (typeof queueMicrotask === 'function') {
    return queueMicrotask(fn);
  }

  return Promise.resolve().then(fn);
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};

export const KindFieldValidators = {
  string: (validate?: (value: string) => boolean) =>
    t.assertions.type('string', validate),
};
