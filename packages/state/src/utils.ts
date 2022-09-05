export const randUint16 = () => {
  return window.crypto.getRandomValues(new Uint16Array(1))[0];
};

export const isValNodeAffected = (c) => {
  for (let i = 0; i < c.path.length; i++) {
    const path = c.path[i];

    if (path.node.type === "Val") {
      return path.node;
    }
  }

  return false;
};

export const isCapitalLetter = (c: string) => c === c.toUpperCase();

export const createKey = (arr: string[]) => arr.join(".");

const HASHED_OBJ = new WeakMap();

export const valueToHash = (value: any): string => {
  if (typeof value === "object") {
    if (!HASHED_OBJ.get(value)) {
      HASHED_OBJ.set(value, randUint16());
    }

    return HASHED_OBJ.get(value);
  }

  return value;
};

export const isPrimitive = (value: any) => {
  return typeof value !== "object";
};

export const isObjectLiteral = (t: any) => {
  return !!t && "object" === typeof t && t.constructor === Object;
};
