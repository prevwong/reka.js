import { Type } from '../node';
import { Validator, assertions } from '../validators';

/**
 * Annotations are used to specify getter/computed properties on a Type
 */
export abstract class Annotation {
  readonly name: string;
  readonly type: Validator;

  constructor(name: string, validator: Validator) {
    this.name = name;
    this.type = assertions.optional(validator);
  }

  abstract compute(node: Type, field: string): any;

  get(node: Type, field: string) {
    const value = this.compute(node, field);

    return this.type.get(value, {
      clone: false,
    });
  }
}
