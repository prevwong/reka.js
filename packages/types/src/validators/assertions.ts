import {
  AnyValidator,
  ArrayValidator,
  ConstantValidator,
  MapValidator,
  ModelValidator,
  NodeValidator,
  OptionalValidator,
  TypeValidator,
  UnionValidator,
} from "./definitions";
import { Validator } from "./validator";

export const type = (type: string) => new TypeValidator(type);
export const node = (node: string, isRef?: boolean) =>
  new NodeValidator(node, isRef);
export const union = (...validators: Validator[]) =>
  new UnionValidator(validators);
export const array = (validator: Validator) => new ArrayValidator(validator);
export const optional = (validator: Validator) =>
  new OptionalValidator(validator);
export const map = (validator: Validator) => new MapValidator(validator);
export const model = (model: Record<string, Validator>) =>
  new ModelValidator(model);
export const constant = (value: string) => new ConstantValidator(value);
export const enumeration = (...constants: string[]) =>
  union(...constants.map((c) => constant(c)));
export const any = new AnyValidator();
export const string = type("string");
export const number = type("number");
export const boolean = type("boolean");
export const nullish = type("null");
export const func = type("Function");
