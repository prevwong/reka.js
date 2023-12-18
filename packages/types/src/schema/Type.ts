import { getRandomId, invariant } from '@rekajs/utils';

import { Schema } from './Schema';

export class Type {
  declare readonly type: string;
  declare id: string;

  constructor(type: string, json?: any) {
    this.type = type;
    this.id = json?.id ?? getRandomId();

    const definition = Schema.get(this.type);
    invariant(
      !!definition,
      `Schema definition not found for type "${this.type}"`
    );

    definition.fields.forEach((field) => {
      this[field.name] = field.type.get(json?.[field.name]);
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
