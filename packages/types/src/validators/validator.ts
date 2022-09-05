export class Validator {
  protected validate?<V>(value: V): boolean;
  protected format?<V>(value: V): any;
  is: string;

  constructor(is: string) {
    this.is = is;
  }

  get<V>(value: V) {
    try {
      let bool = true;
      if (this.validate) {
        bool = this.validate(value);
      }

      if (bool === false) {
        throw new Error("Invalid type");
      }

      if (!this.format) {
        return value;
      }

      return this.format(value);
    } catch (err) {
      throw new TypeError(
        `${err} Invalid field type ${JSON.stringify(
          value,
          null,
          2
        )} ${JSON.stringify(this, null, 2)}`
      );
    }
  }
}
