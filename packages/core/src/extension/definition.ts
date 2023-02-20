import * as t from '@rekajs/types';

import { Extension } from './extension';

export type ExtensionStateDefinition = Record<string, any>;

type Require<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export interface ExtensionConfig<
  S extends ExtensionStateDefinition | any = undefined
> {
  key: string;
  state: S;
  init: (extension: Extension<ExtensionDefinition<S>>) => void;
  dispose: (extension: Extension<ExtensionDefinition<S>>) => void;
  fromJSON: (state: any) => S;
}

export class ExtensionDefinition<
  S extends ExtensionStateDefinition | any = any
> {
  declare key: string;
  declare globals: Record<string, any>;
  declare components: t.Component[];
  declare state: S;

  declare fromJSON: (state: any) => S;
  declare init: (extension: Extension<ExtensionDefinition<S>>) => void;
  declare dispose: (extension: Extension<ExtensionDefinition<S>>) => void;

  constructor(config: Require<Partial<ExtensionConfig<S>>, 'key'>) {
    this.key = config.key;
    this.state = config.state as S;
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

export const createExtension = <S extends ExtensionStateDefinition>(
  config: Require<Partial<ExtensionConfig<S>>, 'key'>
) => {
  return new ExtensionDefinition<S>(config);
};
