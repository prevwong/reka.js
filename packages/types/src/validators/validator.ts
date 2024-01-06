import { TypeConstructorOptions } from '../node';

export class Validator {
  protected validate?<V>(value: V): boolean;
  protected format?<V>(value: V, opts: TypeConstructorOptions): any;

  is: string;

  constructor(is: string) {
    this.is = is;
  }

  get<V>(value: V, opts: TypeConstructorOptions) {
    try {
      let bool = true;
      if (this.validate) {
        bool = this.validate(value);
      }

      if (bool === false) {
        throw new Error('Invalid type');
      }

      if (!this.format) {
        return value;
      }

      return this.format(value, opts);
    } catch (err) {
      throw new TypeError(
        `Validatation<${this.is}> failed for value "${JSON.stringify(
          value,
          null,
          2
        )}"`
      );
    }
  }
}
