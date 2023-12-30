import * as t from '@rekajs/types';

import { ExtensionDefinition } from './extension';
import { Reka } from './reka';
import { KindFieldValidators } from './utils';
import { Changeset } from './observer';

export type StateExternalFunction = (opts: Record<string, any>) => any;
export type StateExternalFunctions = Array<t.ExternalFunc>;
export type StateExternalFunctionsFactory = (
  reka: Reka
) => StateExternalFunctions;

export type StateExternalStates = Array<t.ExternalState>;

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

export type CustomKindConfig = {
  fallback?: any;
  // Note: this is currently just decorative and doesn't do anything
  // TODO: enforce validation in evaluator
  validate: (field: typeof KindFieldValidators) => t.Validator;
};

export type CustomKindDefinition = {
  fallback: any;
  validator: t.Validator;
};

export type RekaOpts = {
  kinds?: Record<string, CustomKindConfig>;
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

export type ScopeDescription = {
  level: 'external' | 'global' | 'component' | 'template' | 'function';
  id: string;
};

export type IdentifiableWithScope = {
  identifiable: t.Identifiable;
  scope: ScopeDescription;
};

export type RekaChangesetInfo = {
  history: {
    throttle: number;
    ignore: boolean;
  };
};

export type RekaStateChangeset = Changeset<RekaChangesetInfo>;

export type RekaChangeOpts = {
  history: Partial<{
    ignore: boolean;
    throttle: number;
  }>;
  info: RekaChangesetInfo;
  source: string;
};
