import { invariant } from '@rekajs/utils';

import { Type } from './type';

const NodeTreeSymbol = Symbol('RekaNodeTree');

/**
 * @internal
 */
export abstract class Tree {
  readonly id: string;
  readonly root: Type;

  constructor(id: string, root: Type) {
    this.id = id;
    this.root = root;
  }

  abstract resolveProp(node: Type, name: string): any;

  addNodeToTree(node: Type) {
    Tree.setNodeTree(node, this);
  }

  static getNodeTree(node: Type) {
    return node[NodeTreeSymbol];
  }

  static setNodeTree(node: Type, tree: Tree) {
    const existingNodeTree = Tree.getNodeTree(node);

    // Don't allow nodes to be used across multiple tree, as it can lead to bugs
    if (existingNodeTree) {
      invariant(
        existingNodeTree === tree,
        `${node.type}<${node.id}> is already part of a different Tree<${existingNodeTree.id}>.`
      );
    }

    node[NodeTreeSymbol] = tree;
  }
}
