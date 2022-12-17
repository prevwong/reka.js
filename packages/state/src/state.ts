import * as t from '@composite/types';
import { computed, makeObservable, observable, reaction } from 'mobx';
import { Computation } from './computation';

import { Environment } from './environment';
import { computeExpression } from './expression';
import { ExtensionDefinition, ExtensionRegistry } from './extension';
import { Frame, FrameOpts } from './frame';
import { ChangeListenerSubscriber, Observer } from './observer';
import { Resolver } from './resolver';

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

export class Composite {
  frames: Frame[];

  declare env: Environment;
  declare resolver: Resolver;
  declare state: t.State;

  private declare observer: Observer<t.State>;
  private declare extensionRegistry: ExtensionRegistry;

  private syncGlobals: Computation<void> | null = null;
  private syncComponents: Computation<void> | null = null;
  private syncCleanupEnv: Computation<void> | null = null;
  private idToFrame: Map<string, Frame> = new Map();
  private subscribers: Set<StateSubscriber<any>> = new Set();
  private subscriberDisposers: WeakMap<any, any> = new WeakMap();

  constructor(private readonly opts: StateOpts) {
    this.frames = [];
  }

  get config() {
    const config = {
      globals: this.opts.globals || {},
      components: this.opts.components || [],
    };

    this.extensionRegistry.extensions.forEach((extension) => {
      Object.assign(config.globals, extension.definition.globals);
      config.components.push(...extension.definition.components);
    });

    return config;
  }

  get root() {
    return this.state.program;
  }

  get allComponents() {
    return [...(this.config.components ?? []), ...this.root.components];
  }

  load(state: t.State) {
    this.state = t.state(state);
    this.env = new Environment(this);
    this.resolver = new Resolver(this);
    this.frames = [];

    makeObservable(this, {
      config: computed,
      state: observable,
      allComponents: computed,
    });

    this.extensionRegistry = new ExtensionRegistry(
      this,
      this.opts.extensions ?? []
    );

    this.observer = new Observer(this.state, {
      hooks: {
        onDispose: (payload) => {
          if (payload.type instanceof t.Identifier) {
            this.resolver.removeDistance(payload.type);
          }
        },
      },
    });

    this.extensionRegistry.init();
    this.sync();
  }

  sync() {
    this.resolver.resolveProgram();

    if (!this.syncGlobals) {
      this.syncGlobals = new Computation(
        () => {
          Object.entries(this.config.globals).forEach(([key, value]) => {
            this.env.set(key, value);
          });

          this.root.globals.forEach((global) => {
            this.env.set(
              global.name,
              computeExpression(global.init, this as any, this.env)
            );
          });
        },
        {
          keepAlive: true,
        }
      );
    }

    if (!this.syncComponents) {
      this.syncComponents = new Computation(
        () => {
          this.allComponents.forEach((component) => {
            this.env.set(component.name, component);
          });
        },
        {
          keepAlive: true,
        }
      );
    }

    if (!this.syncCleanupEnv) {
      this.syncCleanupEnv = new Computation(
        () => {
          const globalVarNames = [
            ...Object.keys(this.config.globals),
            ...this.root.globals.map((global) => global.name),
          ];
          const componentNames = this.allComponents.map(
            (component) => component.name
          );

          const envBindingNames = [...globalVarNames, ...componentNames];

          for (const key of this.env.bindings.keys()) {
            if (envBindingNames.indexOf(key) > -1) {
              continue;
            }

            this.env.delete(key);
          }
        },
        {
          keepAlive: true,
        }
      );
    }

    this.syncGlobals.get();
    this.syncComponents.get();
    this.syncCleanupEnv.get();

    this.frames.forEach((frame) => {
      frame.render();
    });
  }

  change(mutator: () => void) {
    this.observer.change(() => {
      mutator();
    });

    this.sync();
  }

  createFrame(opts: FrameOpts) {
    const frame = new Frame(opts, this);

    if (opts.id) {
      this.idToFrame.set(opts.id, frame);
    }

    this.frames.push(frame);

    frame.render();

    return frame;
  }

  removeFrame(frame: Frame) {
    this.frames.splice(this.frames.indexOf(frame), 1);

    if (!frame.id) {
      return;
    }

    this.idToFrame.delete(frame.id);
  }

  getFrameById(id: string) {
    return this.idToFrame.get(id);
  }

  getExtension<E extends ExtensionDefinition<any>>(definition: E) {
    return this.extensionRegistry.getExtensionFromDefinition(definition);
  }

  getNodeFromId<T extends t.Type = t.Any>(
    id: string,
    expectedType?: t.TypeConstructor<T>
  ) {
    return this.observer.getTypeFromId(id, expectedType);
  }

  getParentType(type: t.Type) {
    return this.observer.getParentMap(type);
  }

  getParent<T extends t.Type = t.Any>(
    node: t.Type,
    expectedParentType?: t.TypeConstructor<T>
  ) {
    return this.observer.getParent(node, expectedParentType);
  }

  listenToChanges(changeListenerSubscriber: ChangeListenerSubscriber) {
    return this.observer.listenToChanges(changeListenerSubscriber);
  }

  subscribe<C>(
    collect: (composite: Composite) => C,
    onCollect: (collected: C, prevCollected: C) => void,
    opts?: StateSubscriberOpts
  ) {
    const subscriber: StateSubscriber<any> = {
      collect,
      onCollect,
      opts: {
        fireImmediately: false,
        ...(opts ?? {}),
      },
    };

    this.subscribers.add(subscriber);

    const disposeReaction = reaction(
      () => subscriber.collect(this),
      (collected, prevCollected) => {
        subscriber.onCollect(collected, prevCollected);
      },
      {
        fireImmediately: subscriber.opts.fireImmediately,
      }
    );

    const dispose = () => {
      disposeReaction();
      this.subscribers.delete(subscriber);
    };

    this.subscriberDisposers.set(subscriber, dispose);

    return dispose;
  }

  dispose() {
    if (this.syncGlobals) {
      this.syncGlobals.dispose();
    }

    if (this.syncComponents) {
      this.syncComponents.dispose();
    }

    if (this.syncCleanupEnv) {
      this.syncCleanupEnv.dispose();
    }

    this.observer.dispose();
    this.extensionRegistry.dispose();
  }

  toJSON() {
    return this.state;
  }
}
