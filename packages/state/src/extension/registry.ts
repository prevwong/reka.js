import invariant from 'tiny-invariant';

import { State } from '../state';
import { ExtensionDefinition } from './definition';
import { Extension } from './extension';

export class ExtensionRegistry {
  private definitionToExtension: WeakMap<ExtensionDefinition, Extension> =
    new WeakMap();
  private keyToExtension: Map<string, Extension> = new Map();
  extensions: Extension[] = [];

  constructor(readonly composite: State, definitions: ExtensionDefinition[]) {
    definitions.forEach((definition) => {
      const extension = new Extension(this.composite, definition);
      this.definitionToExtension.set(definition, extension);
      this.keyToExtension.set(definition.key, extension);
      this.extensions.push(extension);
    });
  }

  init() {
    this.extensions.map((extension) => extension.init());
  }

  getExtensionFromDefinition<E extends ExtensionDefinition<any>>(
    definition: E
  ): Extension<E['state']> {
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

  replace() {
    console.log('replacing');
    Object.keys(this.composite.data.extensions).forEach((key) => {
      const extensionState = this.composite.data.extensions[key];
      const extension = this.getExtensionByKey(key);

      extension['_state'] = extensionState;

      extension.init();
    });

    // this.composite.data.extensions.forEach((extensionState, i) => {
    //   this.extensions[i]['_state'] = extensionState;
    //   this.extensionToExtensionState.set(this.extensions[i], extensionState);
    //   this.extensionStateToExtension.set(extensionState, this.extensions[i]);
    //   this.extensions[i].init(this.extensions[i]);
    // });
  }
}
