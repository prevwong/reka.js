/* eslint-disable @typescript-eslint/ban-types */
import { Schema, Type, TypeProperties } from './schema';
import * as t from './types.generated';

export const switchTypes = (node: t.Any, visitor: Partial<t.Visitor>) => {
  let currentType = node.type;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (visitor[currentType]) {
      return visitor[currentType](node);
    }

    const schema = Schema.get(currentType);

    if (schema.extends) {
      currentType = schema.extends;
      continue;
    }

    break;
  }
};

export const isLiteralObject = (t: any) => {
  return !!t && 'object' === typeof t && t.constructor === Object;
};

type TypeOpt<T extends Type = any> = Partial<{
  exclude: Array<keyof TypeProperties<T>>;
  diff: (a: T, b: T) => any;
}>;

type MergeTypeOpts = {
  function?: (a: Function, b: Function) => any;
  types?: Partial<{
    [K in keyof t.Visitor]: t.Visitor[K] extends (type: infer V) => any
      ? V extends Type
        ? TypeOpt<V>
        : never
      : never;
  }>;
};

export const mergeType = <T extends Type>(a: T, b: T, opts?: MergeTypeOpts) => {
  const getOpt = (type: string): Required<TypeOpt> => {
    const schema = Schema.get(type);

    const cascadedOpt = schema.extends ? getOpt(schema.extends) : null;

    const exclude = opts?.types?.[type]?.exclude || [];
    const diff = opts?.types?.[type]?.diff;

    return {
      exclude: [...exclude, ...(cascadedOpt?.exclude ?? [])].filter(
        (value, index, self) => self.indexOf(value) === index
      ),
      diff: (a, b) => {
        let o;

        if (cascadedOpt?.diff) {
          o = cascadedOpt.diff(a, b);
        }

        if (o !== undefined) {
          return o;
        }

        if (diff) {
          o = diff(a, b);
        }

        if (o !== undefined) {
          return o;
        }
      },
    };
  };

  const mergeValue = (a: any, b: any) => {
    if (a === b) {
      return a;
    }

    // We cannot safely determine the identify of the function
    // So just replace it with the right hand side
    // if (typeof a === "function" && typeof b === "function") {
    //   return b;
    // }

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length > b.length) {
        a.splice(b.length);
      }

      for (let i = 0; i < a.length; i++) {
        const mergedElement = mergeValue(a[i], b[i]);

        if (a[i] === mergedElement) {
          continue;
        }

        // console.log("diff-arr", a[i], mergedElement);

        a[i] = mergedElement;
      }

      for (let i = a.length; i < b.length; i++) {
        // console.log("push", b[i], JSON.parse(JSON.stringify(b[i])));
        a.push(b[i]);
      }

      return a;
    }

    if (a instanceof Type && b instanceof Type) {
      if (a.type !== b.type) {
        return b;
      }

      const options = getOpt(a.type);

      // console.log("diff", a, b, options);

      const o = options.diff(a, b);

      if (o !== undefined) {
        return o;
      }

      const fields = Schema.get(a.type).fields;

      for (const field of fields) {
        if (options.exclude.includes(field.name)) {
          continue;
        }
        // if (a instanceof t.View) {
        //   console.log(
        //     "visiting field",
        //     field.name,
        //     options.exclude.includes(field.name)
        //   );
        // }

        const newValue = mergeValue(a[field.name], b[field.name]);
        if (a[field.name] !== newValue) {
          a[field.name] = newValue;
        }
      }

      return a;
    }

    if (isLiteralObject(a) && isLiteralObject(b)) {
      for (const key in b) {
        if (a[key]) {
          // if (typeof a[key] === "function" && typeof b[key] === "function") {
          //   console.log("func diff", key, [a, b], [a[key], b[key]]);
          // }
          const t = mergeValue(a[key], b[key]);

          a[key] = t;
          continue;
        }

        a[key] = b[key];
      }

      for (const key in a) {
        if (b[key] !== undefined) {
          continue;
        }

        delete a[key];
      }

      return a;
    }

    if (typeof a === 'function' && typeof b === 'function' && opts?.function) {
      const diff = opts.function(a, b);
      if (diff !== undefined) {
        return diff;
      }
    }

    return b;
  };

  return mergeValue(a, b);
};

export const flattenType = <T extends Type>(root: T) => {
  const types: Record<string, any> = {};

  const convert = (value: any) => {
    if (Array.isArray(value)) {
      return value.map((c) => convert(c));
    }

    if (typeof value === 'object') {
      const obj = Object.entries(value).reduce((accum, [k, v]) => {
        return {
          ...accum,
          [k]: convert(v),
        };
      }, {});

      if (value instanceof Type) {
        types[value.id] = obj;
        return {
          $$typeId: value.id,
        };
      }

      return obj;
    }

    return value;
  };

  const flattenRoot = convert(root);

  return {
    types,
    root: flattenRoot,
  };
};

export const unflattenType = ({ root, types }) => {
  const convert = (value) => {
    if (Array.isArray(value)) {
      return value.map((child) => convert(child));
    }

    if (typeof value === 'object') {
      let obj = value;

      let isType = false;

      if (value['$$typeId']) {
        obj = types[value['$$typeId']];
        isType = true;
      }

      const transformedObj = Object.entries(obj).reduce(
        (accum, [key, child]) => {
          return {
            ...accum,
            [key]: convert(child),
          };
        },
        {}
      );

      if (isType) {
        return Schema.fromJSON(transformedObj);
      }

      return transformedObj;
    }

    return value;
  };

  return convert(root);
};

export const collectNestedTypes = (type: any) => {
  const types: any[] = [];

  const collect = (value: any) => {
    if (Array.isArray(value)) {
      value.forEach((c) => collect(c));
      return;
    }

    if (typeof value === 'object') {
      if (value instanceof Type) {
        types.push(value);
      }

      Object.values(value).forEach((v) => {
        collect(v);
      });

      return;
    }
  };

  collect(type);

  return types;
};
