import * as t from '@composite/types';

import { ExtensionDefinition } from './extension';
import { Composite } from './state';

export type StateOpts = {
  components?: t.Component[];
  globals?: Record<string, any>;
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
