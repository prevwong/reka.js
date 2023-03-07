import * as t from '@rekajs/types';
import {
  autorun,
  computed,
  IComputedValue,
  makeObservable,
  observable,
  reaction,
} from 'mobx';

import { Environment } from './environment';
import { computeExpression } from './expression';
import { ExtensionDefinition, ExtensionRegistry } from './extension';
import { Externals } from './externals';
import { Frame, FrameOpts } from './frame';
import { StateOpts, StateSubscriberOpts, StateWatcherOpts } from './interfaces';
import { ChangeListenerSubscriber, Observer } from './observer';
import { Resolver } from './resolver';
import { toJS } from './utils';

export class Reka {
  /**
   * A list of RekaComponent instances
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

  private syncGlobals: IComputedValue<void> | null = null;
  private syncComponents: IComputedValue<void> | null = null;
  private syncCleanupEnv: IComputedValue<void> | null = null;
  private idToFrame: Map<string, Frame> = new Map();

  private init = false;

  externals: Externals;

  constructor(private readonly opts?: StateOpts) {
    this.frames = [];

    this.externals = new Externals(this, opts?.externals);

    makeObservable(this, {
      frames: observable,
      components: computed,
    });
  }

  getExternalState(key: string) {
    return this.externals.getState(key);
  }

  updateExternalState(key: string, value: any) {
    this.change(() => {
      this.externals.updateState(key, value);
    });
  }

  /**
   * Get the Program AST node from State. Shorthand for state.program
   */
  get program() {
    return this.state.program;
  }

  /**
   * All components that exists in the instance. Includes RekaComponents in the Program AST and ExternalComponents that was passed to the instance in the constructor.
   */
  get components() {
    return {
      externals: Object.values(this.externals.components),
      program: this.program.components,
    };
  }

  /**
   * Load a new State data type
   */
  load(state: t.State, syncImmediately: boolean = true) {
    this.init = true;
    this.state = t.state(state);
    this.env = new Environment(this);
    this.resolver = new Resolver(this);
    this.frames = [];

    this.observer = new Observer(this.state, {
      hooks: {
        onDispose: (payload) => {
          if (payload.type instanceof t.Identifier) {
            this.resolver.removeDistance(payload.type);
          }
        },
      },
    });

    this.extensionRegistry = new ExtensionRegistry(
      this,
      this.opts?.extensions ?? []
    );

    this.extensionRegistry.init();

    if (syncImmediately) {
      this.sync();
    } else {
      this.syncHead();
    }

    this.init = false;
  }

  private syncHead() {
    this.resolver.resolveProgram();

    if (!this.syncGlobals) {
      this.syncGlobals = computed(
        () => {
          this.program.globals.forEach((global) => {
            this.env.set(global.name, {
              value: computeExpression(global.init, this as any, this.env),
              readonly: false,
            });
          });
        },
        {
          keepAlive: true,
        }
      );
    }

    if (!this.syncComponents) {
      this.syncComponents = computed(
        () => {
          this.program.components.forEach((component) => {
            this.env.set(component.name, { value: component, readonly: true });
          });
        },
        {
          keepAlive: true,
        }
      );
    }

    if (!this.syncCleanupEnv) {
      this.syncCleanupEnv = computed(
        () => {
          const globalVarNames = this.program.globals.map(
            (global) => global.name
          );

          const componentNames = this.program.components.map(
            (component) => component.name
          );

          const envBindingNames = [...globalVarNames, ...componentNames];

          for (const key of this.env.bindings.keys()) {
            if (typeof key !== 'string') {
              continue;
            }

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
  }

  /**
   * Sync changes made to the State to all active Frames. You usually do not need to call this manually
   */
  sync() {
    this.syncHead();

    return Promise.all(
      this.frames.map((frame) => {
        return frame.compute();
      })
    );
  }

  /**
   * Perform a mutation to the State
   */
  change(mutator: () => void) {
    this.observer.change(mutator);

    // Don't sync yet when we're still setting up (ie: creating the Extensions registry)
    if (this.init) {
      return;
    }

    return this.sync();
  }

  /**
   * Create a new Frame instance
   */
  async createFrame(opts: FrameOpts) {
    const frame = new Frame(opts, this);

    if (opts.id) {
      this.idToFrame.set(opts.id, frame);
    }

    this.frames.push(frame);

    if (!this.init) {
      await frame.compute();
    }

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
  getFrame(id: string) {
    return this.idToFrame.get(id);
  }

  /**
   * Get an Extension's state from its definition
   */
  getExtension<D extends ExtensionDefinition<any>>(definition: D) {
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
   * Subscribe to changes made in a Reka instance
   */
  subscribe<C>(
    collect: (reka: Reka) => C,
    onCollect: (collected: C, prevCollected: C) => void,
    opts?: StateSubscriberOpts
  ) {
    const dispose = reaction(
      () => toJS(collect(this)),
      (collected, prevCollected) => onCollect(collected, prevCollected),
      {
        fireImmediately: opts?.fireImmediately,
      }
    );

    return () => {
      dispose();
    };
  }

  /**
   * Watch changes made within a Reka instance
   */
  watch(cb: () => void, opts?: StateWatcherOpts) {
    const disposer = autorun(() => {
      cb();
    });

    if (opts?.fireImmediately) {
      cb();
    }

    return () => {
      disposer();
    };
  }

  /**
   * Dispose instance, stops all future computations
   */
  dispose() {
    this.observer.dispose();
    this.extensionRegistry.dispose();
  }

  toJSON() {
    return this.state;
  }

  /**
   * Create a new Reka instance
   */
  static create(opts?: StateOpts) {
    return new Reka(opts);
  }
}
