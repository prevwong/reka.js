import { runInAction } from 'mobx';
import invariant from 'tiny-invariant';

import {
  ExtensionDefinition,
  StateFromExtensionDefinition,
} from './definition';
import { Extension } from './extension';

import { Composite } from '../state';

export class ExtensionRegistry {
  private definitionToExtension: WeakMap<ExtensionDefinition, Extension> =
    new WeakMap();
  private keyToExtension: Map<string, Extension> = new Map();
  extensions: Extension[] = [];

  constructor(
    readonly composite: Composite,
    definitions: ExtensionDefinition[]
  ) {
    definitions.forEach((definition) => {
      const extension = new Extension(this.composite, definition);
      this.definitionToExtension.set(definition, extension);
      this.keyToExtension.set(definition.key, extension);
      this.extensions.push(extension);

      runInAction(() => {
        Object.assign(
          this.composite.externals.states,
          extension.definition.globals
        );
        this.composite.externals.components.push(
          ...extension.definition.components
        );
      });
    });
  }

  init() {
    this.composite.change(() => {
      this.extensions.map((extension) => extension.init());
    });
  }

  dispose() {
    this.extensions.map((extension) => extension.dispose());
  }

  getExtensionFromDefinition<E extends ExtensionDefinition<any>>(
    definition: E
  ): StateFromExtensionDefinition<E> {
    const extension = this.definitionToExtension.get(definition);
    invariant(extension, `Extension "${definition.key}" not found`);
    return extension;
  }

  getExtensionStateValue<E extends ExtensionDefinition<any>>(definition: E) {
    const extension = this.getExtensionFromDefinition(definition);
    return extension.state as E['state'];
  }

  getExtensionByKey(key: string) {
    const extension = this.keyToExtension.get(key);
    invariant(extension, `Extension "${key}" not found`);

    return extension;
  }
}
