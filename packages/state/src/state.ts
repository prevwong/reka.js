import * as t from '@rekajs/types';
import {
  computed,
  IComputedValue,
  makeObservable,
  observable,
  reaction,
} from 'mobx';

import { Environment } from './environment';
import { computeExpression } from './expression';
import { ExtensionDefinition, ExtensionRegistry } from './extension';
import { Frame, FrameOpts } from './frame';
import {
  StateExternalGlobalsFactory,
  StateExternals,
  StateOpts,
  StateSubscriberOpts,
} from './interfaces';
import { ChangeListenerSubscriber, Observer } from './observer';
import { Resolver } from './resolver';
import { toJS } from './utils';

export class Reka {
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

  private syncGlobals: IComputedValue<void> | null = null;
  private syncComponents: IComputedValue<void> | null = null;
  private syncCleanupEnv: IComputedValue<void> | null = null;
  private idToFrame: Map<string, Frame> = new Map();

  private init = false;

  externals: StateExternals;

  constructor(private readonly opts?: StateOpts) {
    this.frames = [];

    this.externals = {
      components: opts?.externals?.components ?? [],
      states: opts?.externals?.states ?? {},
      globals: opts?.externals?.globals
        ? this.setupExternalGlobals(opts.externals?.globals)
        : {},
    };

    makeObservable(this, {
      frames: observable,
      externals: observable,
      components: computed,
    });
  }

  private setupExternalGlobals(createGlobals: StateExternalGlobalsFactory) {
    const _globals = createGlobals(this);

    return Object.entries(_globals).reduce((accum, [key, accessor]) => {
      return {
        ...accum,
        [key]: accessor,
      };
    }, {});
  }

  getExternalState(key: string) {
    return this.externals.states[key];
  }

  updateExternalState(key: string, value: any) {
    this.change(() => {
      this.externals.states[key] = value;
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
    return [...(this.externals.components ?? []), ...this.program.components];
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
      this.syncComponents = computed(
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
      this.syncCleanupEnv = computed(
        () => {
          const globalVarNames = [
            ...Object.keys(this.externals.states),
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
  }

  /**
   * Sync changes made to the State to all active Frames. You usually do not need to call this manually
   */
  sync() {
    this.syncHead();

    this.frames.forEach((frame) => {
      frame.compute();
    });
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

    if (!this.init) {
      frame.compute();
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
   * Dispose instance, stops all future re-computations
   */
  dispose() {
    this.observer.dispose();
    this.extensionRegistry.dispose();
  }

  toJSON() {
    return this.state;
  }
}
