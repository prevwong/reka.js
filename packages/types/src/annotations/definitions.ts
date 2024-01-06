import { Annotation } from './annotation';

import { Type, Tree } from '../node';
import { Validator } from '../validators';

/**
 * Specify that a computed field on a Type should be resolved by it's parent Tree
 */
export class ResolvePropAnnotation extends Annotation {
  constructor(validator: Validator) {
    super('resolve-prop', validator);
  }

  compute(node: Type, field: string) {
    const tree = Tree.getNodeTree(node);

    if (!tree) {
      return null;
    }

    return tree.resolveProp(node, field);
  }
}
