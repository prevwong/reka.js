import { getRandomId, invariant } from '@rekajs/utils';

import { Tree } from './tree';

import { getTypeSchema } from '../registry';

export type TypeConstructorOptions = {
  clone:
    | boolean
    | {
        replaceExistingId: boolean;
      };
};

export class Type {
  declare readonly type: string;
  declare id: string;

  constructor(
    type: string,
    json?: any,
    options?: Partial<TypeConstructorOptions>
  ) {
    const opts: TypeConstructorOptions = {
      clone: false,

      ...(options ?? {}),
    };

    this.type = type;

    // Reuse the id specified in the JSON value
    // if cloning.replaceExistingId is not explicitly set to `true`
    if (
      json?.id &&
      (opts.clone === false ||
        opts.clone === true ||
        opts.clone.replaceExistingId === false)
    ) {
      this.id = json.id;
    } else {
      this.id = getRandomId();
    }

    const definition = getTypeSchema(this.type);

    invariant(
      !!definition,
      `Schema definition not found for type "${this.type}"`
    );

    definition.fields.forEach((field) => {
      this[field.name] = field.type.get(json?.[field.name], opts);
    });
  }
}

export type TypeProperties<T extends Type> = Omit<
  {
    [P in keyof T]: T[P];
  },
  keyof Type
>;

export type TypeConstructor<T extends Type> = Function & { prototype: T };
