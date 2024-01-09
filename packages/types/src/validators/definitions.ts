import { isObjectLiteral } from '@rekajs/utils';

import { Validator } from './validator';

import { Type, TypeConstructorOptions } from '../node';
import { getTypeSchema } from '../registry';

export class TypeValidator extends Validator {
  type: string;
  validateFn?: (value: any) => boolean;

  constructor(type: string, validateFn?: (value: any) => boolean) {
    super('type');
    this.type = type;
    this.validateFn = validateFn;
  }

  validate(value: any) {
    if (value === null && this.type === 'null') {
      return true;
    }

    if (value === 'Record') {
      return Object.getPrototypeOf(value) === Object.prototype;
    }

    const isValid = typeof value === this.type.toLowerCase();

    if (!this.validateFn) {
      return isValid;
    }

    return this.validateFn(value);
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

  format(value: any, opts: TypeConstructorOptions) {
    return this.type.get(value === undefined ? this.defaultValue : value, opts);
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
    const schema = getTypeSchema(value.type);

    if (schema.alias && schema.alias.indexOf(this.node) > -1) {
      return true;
    }

    const nodeSchema = getTypeSchema(this.node);

    if (
      nodeSchema.abstract &&
      schema.ctor.prototype instanceof nodeSchema.ctor
    ) {
      return true;
    }

    return false;
  }

  format(value: any, opts: TypeConstructorOptions) {
    if (value instanceof Type && !opts.clone) {
      return value;
    }

    const schema = getTypeSchema(value['type']);

    return schema.create(value, opts);
  }
}

export class UnionValidator extends Validator {
  union: Validator[];

  constructor(validators: Validator[]) {
    super('union');
    this.union = validators;
  }

  format(value: any, opts: TypeConstructorOptions) {
    for (let i = 0; i < this.union.length; i++) {
      try {
        return this.union[i].get(value, opts);
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

  format(value: any, opts: TypeConstructorOptions) {
    return value.map((v: any) => this.array.get(v, opts));
  }
}

export class MapValidator extends Validator {
  type: Validator;

  constructor(validator: Validator) {
    super('map');
    this.type = validator;
  }

  format(value: any, opts: TypeConstructorOptions) {
    return Object.entries(value).reduce(
      (accum, [key, value]) => ({
        ...accum,
        [key]: this.type.get(value, opts),
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

  format(value: any, opts: TypeConstructorOptions) {
    return Object.keys(this.model).reduce((accum, key) => {
      if (!this.model[key]) {
        throw new TypeError('Invalid key in model');
      }

      return {
        ...accum,
        [key]: this.model[key].get(value[key], opts),
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
  constructor(readonly validatorFn?: (value: any) => boolean) {
    super('any');
  }

  validate(value: any) {
    const validator = this.validatorFn;

    if (!validator) {
      return true;
    }

    const _validate = (value: any) => {
      let childrenValidated = true;
      if (Array.isArray(value)) {
        childrenValidated = value.every((item) => _validate(item) === true);
      } else if (isObjectLiteral(value)) {
        childrenValidated = Object.values(value).every((value) => {
          return _validate(value) === true;
        });
      }

      return validator(value) && childrenValidated;
    };

    return _validate(value);
  }
}
