import { annotations, Annotation } from '../annotations';
import { Type, TypeConstructorOptions } from '../node';
import { SchemaRegistry } from '../registry';
import { assertions, Validator } from '../validators';

export type SchemaDefinitionOpts = {
  extends?: string;
  scope?: boolean;
  abstract?: boolean;
  alias?: string[];
  fields?: (assertionsDef: typeof assertions) => Record<string, any>;
  annotations?: (
    annotationsDef: typeof annotations,
    assertionsDef: typeof assertions
  ) => Record<string, any>;
};

export type SchemaField = {
  name: string;
  type: Validator;
};

export type SchemaAnnotation = {
  name: string;
  annotation: Annotation;
};

export class Schema {
  private ownFields: SchemaField[] = [];
  scope: boolean = false;
  extends: string | null = null;
  abstract: boolean = false;
  alias?: string[] = [];
  annotations: Record<string, Annotation>;

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
    this.annotations = opts.annotations?.(annotations, assertions) ?? {};
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

  create(value: any, opts?: Partial<TypeConstructorOptions>) {
    return new this.ctor(value, opts);
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

  static fromJSON(json: any, opts?: Partial<TypeConstructorOptions>) {
    const { type } = json;
    const schema = Schema.get(type);

    if (!type) {
      return;
    }

    return new schema.ctor(json, opts);
  }

  static getRegistry() {
    return SchemaRegistry;
  }

  static computeAnnotatedProp(node: Type, prop: string) {
    const schema = Schema.get(node.type);

    const annotation = schema.annotations[prop];

    return annotation.get(node, prop);
  }
}
