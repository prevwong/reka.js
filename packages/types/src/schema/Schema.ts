import { Type } from './Type';

import { assertions, Validator } from '../validators';

export const SchemaRegistry: Record<string, Schema> = Object.create(null);

export type SchemaDefinitionOpts = {
  extends?: string;
  scope?: boolean;
  abstract?: boolean;
  alias?: string[];
  fields?: (types: typeof assertions) => Record<string, any>;
};

export type SchemaField = {
  name: string;
  type: Validator;
};

export class Schema {
  private ownFields: SchemaField[] = [];
  scope: boolean = false;
  extends: string | null = null;
  abstract: boolean = false;
  alias?: string[] = [];

  declare ctor: any;

  constructor(readonly type: string, opts: SchemaDefinitionOpts) {
    this.ownFields = opts.fields
      ? Object.entries(opts.fields(assertions)).reduce<SchemaField[]>(
          (accum, [name, type]) => {
            return [...accum, { name, type }];
          },
          []
        )
      : [];

    this.scope = opts.scope || false;
    this.extends = opts.extends || null;
    this.abstract = opts.abstract || false;
    this.alias = opts.alias;
  }

  get fields(): SchemaField[] {
    const extendedFields = this.extends
      ? Schema.get(this.extends).fields.filter(
          (field) =>
            !this.ownFields.find((ownField) => ownField.name === field.name)
        )
      : [];

    return [...extendedFields, ...this.ownFields];
  }

  getField(key: string, value: any) {
    return this.fields[key].get(value);
  }

  static define(type: string, properties: SchemaDefinitionOpts) {
    const builder = new Schema(type, properties);
    SchemaRegistry[type] = builder;
    return builder;
  }

  static register(
    type: string,
    ctor:
      | (abstract new (...args: any[]) => Type)
      | (new (...args: any[]) => Type)
  ) {
    SchemaRegistry[type].ctor = ctor;
  }

  static get(type: string) {
    return SchemaRegistry[type];
  }

  static fromJSON(json: any) {
    const { type } = json;
    const schema = Schema.get(type);

    if (!type) {
      return;
    }

    return new schema.ctor(json);
  }

  static getRegistry() {
    return SchemaRegistry;
  }
}
