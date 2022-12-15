import { Schema, Type } from '../schema';

import { Validator } from './validator';

export class TypeValidator extends Validator {
  type: string;

  constructor(type: string) {
    super('type');
    this.type = type;
  }

  validate(value: any) {
    if (value === null && this.type === 'null') {
      return true;
    }

    if (value === 'Record') {
      return Object.getPrototypeOf(value) === Object.prototype;
    }

    return typeof value === this.type.toLowerCase();
  }
}

export class DefaultValidator extends Validator {
  type: Validator;
  defaultValue: any;

  constructor(validator: Validator, defaultValue: any) {
    super('default');
    this.type = validator;
    this.defaultValue = defaultValue;
  }

  format(value: any) {
    return this.type.get(value === undefined ? this.defaultValue : value);
  }
}

export class OptionalValidator extends Validator {
  type: Validator;

  constructor(type: Validator) {
    super('optional');
    this.type = type;
  }

  validate() {
    return true;
  }

  format(value: any) {
    if (value === undefined) {
      return value;
    }

    return this.type.get(value);
  }
}

export class NodeValidator extends Validator {
  node: string;
  isRef: boolean;

  constructor(node: string, isRef?: boolean) {
    super('node');
    this.node = node;
    this.isRef = isRef !== undefined ? isRef : false;
  }

  validate(value: any) {
    if (value.type === this.node) {
      return true;
    }

    // Check if matching alias
    const schema = Schema.get(value.type);

    if (schema.alias && schema.alias.indexOf(this.node) > -1) {
      return true;
    }

    const nodeSchema = Schema.get(this.node);

    if (
      nodeSchema.abstract &&
      schema.ctor.prototype instanceof nodeSchema.ctor
    ) {
      return true;
    }

    return false;
  }

  format(value: any) {
    if (value instanceof Type) {
      return value;
    }

    return Schema.fromJSON(value);
  }
}

export class UnionValidator extends Validator {
  union: Validator[];

  constructor(validators: Validator[]) {
    super('union');
    this.union = validators;
  }

  format(value: any) {
    for (let i = 0; i < this.union.length; i++) {
      try {
        return this.union[i].get(value);
      } catch (err) {
        if (i < this.union.length - 1) {
          continue;
        }

        throw new TypeError('No matching field types');
      }
    }
  }
}

export class ArrayValidator extends Validator {
  array: Validator;

  constructor(validator: Validator) {
    super('array');
    this.array = validator;
  }

  validate(value: any) {
    return Array.isArray(value);
  }

  format(value: any) {
    return value.map((v: any) => this.array.get(v));
  }
}

export class MapValidator extends Validator {
  type: Validator;

  constructor(validator: Validator) {
    super('map');
    this.type = validator;
  }

  format(value: any) {
    return Object.entries(value).reduce(
      (accum, [key, value]) => ({
        ...accum,
        [key]: this.type.get(value),
      }),
      {}
    );
  }
}

export class ModelValidator extends Validator {
  model: Record<string, Validator>;

  constructor(model: Record<string, Validator>) {
    super('model');
    this.model = model;
  }

  format(value: any) {
    return Object.keys(this.model).reduce((accum, key) => {
      if (!this.model[key]) {
        throw new TypeError('Invalid key in model');
      }

      return {
        ...accum,
        [key]: this.model[key].get(value[key]),
      };
    }, {});
  }
}

export class ConstantValidator extends Validator {
  value: string;

  constructor(value: string) {
    super('constant');
    this.value = value;
  }

  validate(value: any) {
    return value === this.value;
  }
}

export class AnyValidator extends Validator {
  constructor() {
    super('any');
  }

  validate() {
    return true;
  }
}
