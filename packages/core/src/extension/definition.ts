import * as t from '@rekajs/types';

import { Extension } from './extension';

export type ExtensionStateDefinition = Record<string, any>;

type Require<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export interface ExtensionConfig<
  S extends ExtensionStateDefinition | any = undefined,
  V extends Record<string, any> = any
> {
  key: string;
  state: S;
  volatile: V;
  init: (extension: Extension<ExtensionDefinition<S, V>>) => void;
  dispose: (extension: Extension<ExtensionDefinition<S, V>>) => void;
  fromJSON: (state: any) => S;
}

export type ExtensionStateFromDefinition<D extends ExtensionDefinition> =
  D['state'];

export type ExtensionVolatileStateFromDefinition<
  D extends ExtensionDefinition
> = D['volatile'];

export class ExtensionDefinition<
  S extends ExtensionStateDefinition | any = any,
  V extends Record<string, any> = any
> {
  declare key: string;
  declare globals: Record<string, any>;
  declare components: t.Component[];
  declare state: S;
  declare volatile: V;

  declare fromJSON: (state: any) => S;
  declare init: (extension: Extension<ExtensionDefinition<S>>) => void;
  declare dispose: (extension: Extension<ExtensionDefinition<S>>) => void;

  constructor(config: Require<Partial<ExtensionConfig<S, V>>, 'key'>) {
    this.key = config.key;
    this.state = config.state as S;
    this.volatile = config.volatile as V;
    this.fromJSON =
      config.fromJSON ||
      ((state) => {
        return state;
      });

    /* eslint-disable no-alert, @typescript-eslint/no-empty-function */
    this.init = config.init || (() => {});
    this.dispose = config.dispose || (() => {});
    /* eslint-enable no-alert, @typescript-eslint/no-empty-function */
  }
}

export const createExtension = <
  S extends ExtensionStateDefinition,
  V extends Record<string, any>
>(
  config: Require<Partial<ExtensionConfig<S, V>>, 'key'>
) => {
  return new ExtensionDefinition<S, V>(config);
};
