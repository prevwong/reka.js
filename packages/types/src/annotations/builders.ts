import { ResolvePropAnnotation } from './definitions';

import { Validator } from '../validators';

export const resolveProp = (validator: Validator) =>
  new ResolvePropAnnotation(validator);
