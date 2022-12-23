import * as t from '@composite/types';
import * as Y from 'yjs';

import { isLiteralObject, isPrimitiveValue } from './types';

export const jsToYType = (value: any) => {
  let typesToInsert: Record<string, any> = {};

  const convert = (value: any) => {
    if (isPrimitiveValue(value) || value === undefined || value === null) {
      return value;
    }

    if (Array.isArray(value)) {
      const arr = new Y.Array();
      const children = value.map((c) => convert(c));
      arr.push(children);
      return arr;
    }

    if (isLiteralObject(value)) {
      const map = new Y.Map();

      if (value instanceof t.Type) {
        const f = t.flatten(value);

        typesToInsert = {
          ...typesToInsert,
          ...Object.keys(f.types).reduce(
            (accum, id) => ({
              ...accum,
              [id]: convert(f.types[id]),
            }),
            {}
          ),
        };

        map.set('$$typeId', f.root.$$typeId);
      } else {
        Object.entries(value).forEach(([key, c]) => {
          map.set(key, convert(c));
        });
      }

      return map;
    }
  };

  const converted = convert(value);
  return {
    typesToInsert,
    converted,
  };
};
