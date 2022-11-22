import * as t from '@composite/types';

import { Extension } from './extension';

export type ExtensionStateDefinition = Record<string, any>;

type Require<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export interface ExtensionConfig<
  S extends ExtensionStateDefinition | any = undefined
> {
  key: string;
  globals: Record<string, any>;
  components: t.Component[];
  state: S;
  init: (extension: Extension<S>) => void;
}

export class ExtensionDefinition<
  S extends ExtensionStateDefinition | any = undefined
> {
  declare key: string;
  declare globals: Record<string, any>;
  declare components: t.Component[];
  declare state: S;
  declare init: (extension: Extension<S>) => void;

  constructor(config: Require<Partial<ExtensionConfig<S>>, 'key'>) {
    Object.assign(this, config);
  }
}

export const createExtension = <S extends ExtensionStateDefinition>(
  config: ExtensionConfig<S>
) => {
  return new ExtensionDefinition<S>(config);
};
