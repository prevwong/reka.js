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
  dispose: (extension: Extension<S>) => void;
  fromJSON: (state: any) => S;
}

export class ExtensionDefinition<
  S extends ExtensionStateDefinition | any = undefined
> {
  declare key: string;
  declare globals: Record<string, any>;
  declare components: t.Component[];
  declare state: S;

  declare fromJSON: (state: any) => S;
  declare init: (extension: Extension<S>) => void;
  declare dispose: (extension: Extension<S>) => void;

  constructor(config: Require<Partial<ExtensionConfig<S>>, 'key'>) {
    this.key = config.key;
    this.globals = config.globals || {};
    this.components = config.components || [];
    this.state = config.state as S;
    this.fromJSON =
      config.fromJSON ||
      ((state) => {
        return state;
      });

    this.init = config.init || (() => {});
    this.dispose = config.dispose || (() => {});
  }
}

export const createExtension = <S extends ExtensionStateDefinition>(
  config: Require<Partial<ExtensionConfig<S>>, 'key'>
) => {
  return new ExtensionDefinition<S>(config);
};
