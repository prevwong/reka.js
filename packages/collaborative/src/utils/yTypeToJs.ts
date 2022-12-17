import { Composite } from '@composite/state';
import * as t from '@composite/types';
import * as Y from 'yjs';

export const yTypeToJS = (composite: Composite, types: any, yType: any) => {
  const convert = (value: any) => {
    // console.log("converting", value);
    if (value instanceof Y.Map) {
      if (value.get('$$typeId')) {
        // throw new Error(value.get("$$typeId"));
        let x = composite.getNodeFromId(value.get('$$typeId'));

        if (!x && types.get(value.get('$$typeId'))) {
          const rootId = value.get('$$typeId');

          // TODO: create a more specialize unflattenType method that works with YTypes
          // Because we don't want to do types.toJSON() which could be a little expensive
          x = t.unflattenType({
            types: types.toJSON(),
            root: {
              $$typeId: rootId,
            },
          });
        }

        if (!x) {
          throw new Error(value.get('$$typeId'));
        }

        return x;
      }

      if (value.get('$$type')) {
        return t.Schema.fromJSON(value.toJSON());
      }

      const obj = {};

      value.forEach((child, key) => {
        obj[key] = convert(child);
      });

      return obj;
    }

    if (value instanceof Y.Array) {
      return value.map((child) => convert(child));
    }

    return value;
  };

  return convert(yType);
};
