import * as t from '@composite/types';
import { computed, makeObservable, observable, reaction } from 'mobx';

import { Computation } from './computation';
import { Environment } from './environment';
import { computeExpression } from './expression';
import { ExtensionDefinition, ExtensionRegistry } from './extension';
import { Frame, FrameOpts } from './frame';
import { StateOpts, StateSubscriber, StateSubscriberOpts } from './interfaces';
import { ChangeListenerSubscriber, Observer } from './observer';
import { Resolver } from './resolver';

export class Composite {
  /**
   * Stores all existing Frames
   */
  frames: Frame[];

  /**
   * The primary State data structure. Changes to the State will cause all Frames to recompute their output View
   */
  declare state: t.State;

  /// @internal
  declare env: Environment;

  /// @internal
  declare resolver: Resolver;

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

  /**
   * Configuration options that the instance was created with
   */
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

  /**
   * Get the Program AST node from State. Shorthand for state.program
   */
  get program() {
    return this.state.program;
  }

  /**
   * All components that exists in the instance. Includes CompositeComponents in the Program AST and ExternalComponents that was passed to the instance in the constructor.
   */
  get components() {
    return [...(this.config.components ?? []), ...this.program.components];
  }

  /**
   * Load a new State data type
   */
  load(state: t.State) {
    this.state = t.state(state);
    this.env = new Environment(this);
    this.resolver = new Resolver(this);
    this.frames = [];

    makeObservable(this, {
      config: computed,
      state: observable,
      components: computed,
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

  /**
   * Sync changes made to the State to all active Frames. You usually do not need to call this manually
   */
  sync() {
    this.resolver.resolveProgram();

    if (!this.syncGlobals) {
      this.syncGlobals = new Computation(
        () => {
          Object.entries(this.config.globals).forEach(([key, value]) => {
            this.env.set(key, value);
          });

          this.program.globals.forEach((global) => {
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
          this.components.forEach((component) => {
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
            ...this.program.globals.map((global) => global.name),
          ];
          const componentNames = this.components.map(
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
      frame.compute();
    });
  }

  /**
   * Perform a mutation to the State
   */
  change(mutator: () => void) {
    this.observer.change(() => {
      mutator();
    });

    this.sync();
  }

  /**
   * Create a new Frame instance
   */
  createFrame(opts: FrameOpts) {
    const frame = new Frame(opts, this);

    if (opts.id) {
      this.idToFrame.set(opts.id, frame);
    }

    this.frames.push(frame);

    frame.compute();

    return frame;
  }

  /**
   * Remove an existing Frame instance
   */
  removeFrame(frame: Frame) {
    this.frames.splice(this.frames.indexOf(frame), 1);

    if (!frame.id) {
      return;
    }

    this.idToFrame.delete(frame.id);
  }

  /**
   * Get a Frame instance by its id (if it has an id specified to it)
   */
  getFrameById(id: string) {
    return this.idToFrame.get(id);
  }

  /**
   * Get an Extension's state from its definition
   */
  getExtension<E extends ExtensionDefinition<any>>(definition: E) {
    return this.extensionRegistry.getExtensionFromDefinition(definition);
  }

  /**
   * Get an AST node by its id from the State
   */
  getNodeFromId<T extends t.Type = t.Any>(
    id: string,
    expectedType?: t.TypeConstructor<T>
  ) {
    return this.observer.getTypeFromId(id, expectedType);
  }

  /**
   * Get a parent Node of an AST node
   */
  getParent<T extends t.Type = t.Any>(
    node: t.Type,
    expectedParentType?: t.TypeConstructor<T>
  ) {
    return this.observer.getParent(node, expectedParentType);
  }

  /**
   * Listen for changes and mutations made to the State
   */
  listenToChanges(changeListenerSubscriber: ChangeListenerSubscriber) {
    return this.observer.listenToChanges(changeListenerSubscriber);
  }

  /**
   * Subscribe to State changes for collected values
   */
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

  /**
   * Dispose instance, stops all future re-computations
   */
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
