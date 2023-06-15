import * as t from '@rekajs/types';

import { ExtensionDefinition } from './extension';
import { Reka } from './reka';

export type StateExternalFunction = (opts: Record<string, any>) => any;
export type StateExternalFunctions = Record<string, StateExternalFunction>;
export type StateExternalFunctionsFactory = (
  reka: Reka
) => StateExternalFunctions;

export type StateExternalStates = Record<string, any>;

export type StateExternals = {
  states: StateExternalStates;
  functions: StateExternalFunctions;
  components: t.Component[];
};

export type RekaExternalsFactory = {
  states: StateExternalStates;
  functions: StateExternalFunctionsFactory;
  components: t.Component[];
};

export type RekaOpts = {
  externals?: Partial<RekaExternalsFactory>;
  extensions?: ExtensionDefinition<any>[];
};

export type StateSubscriberOpts = {
  fireImmediately?: boolean;
};

export type StateSubscriber<C> = {
  collect: (reka: Reka) => C;
  onCollect: (collected: C, prevCollected: C) => void;
  opts: StateSubscriberOpts;
};
