import * as t from '@rekajs/types';

import { ExtensionDefinition } from './extension';
import { Reka } from './state';

export type StateExternalGlobalAccessor = (opts: Record<string, any>) => any;
export type StateExternalGlobals = Record<string, StateExternalGlobalAccessor>;
export type StateExternalGlobalsFactory = (reka: Reka) => StateExternalGlobals;

type StateExternalLocals = Record<string, any>;

export type StateExternals = {
  states: StateExternalLocals;
  globals: StateExternalGlobals;
  components: t.Component[];
};

export type StsteExternalsFactory = {
  states: StateExternalLocals;
  globals: StateExternalGlobalsFactory;
  components: t.Component[];
};

export type StateOpts = {
  externals?: Partial<StsteExternalsFactory>;
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
