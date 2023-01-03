import * as t from '@composite/types';

import { ExtensionDefinition } from './extension';
import { Composite } from './state';

export type StateExternals = {
  values: Record<string, any>;
  components: t.Component[];
};

export type StateOpts = {
  externals?: Partial<StateExternals>;
  extensions?: ExtensionDefinition<any>[];
};

export type StateSubscriberOpts = {
  fireImmediately?: boolean;
};

export type StateSubscriber<C> = {
  collect: (composite: Composite) => C;
  onCollect: (collected: C, prevCollected: C) => void;
  opts: StateSubscriberOpts;
};
