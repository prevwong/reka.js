import invariant from 'invariant';
import shortUUID from 'short-uuid';

import { Schema } from './Schema';

export class Type {
  declare type: string;
  declare id: string;

  constructor(type: string, json: any) {
    this.type = type;
    this.id = json.id || shortUUID.generate();

    const definition = Schema.get(this.type);
    invariant(
      !!definition,
      `Schema definition not found for type "${this.type}"`
    );

    definition.fields.forEach((field) => {
      this[field.name] = field.type.get(json[field.name]);
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
