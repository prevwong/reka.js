import * as t from '@rekajs/types';
import { getRandomId, invariant } from '@rekajs/utils';
import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  reaction,
} from 'mobx';
import { computedFn } from 'mobx-utils';

import { ExtensionDefinition, ExtensionRegistry } from './extension';
import { Externals } from './externals';
import { Frame, FrameOpts } from './frame';
import { Head } from './head';
import { RekaOpts, StateSubscriberOpts } from './interfaces';
import { ChangeListenerSubscriber, Observer } from './observer';
import { ExtensionVolatileStateKey, ExternalVolatileStateKey } from './symbols';

export class Reka {
  id: string;

  /**
   * A list of RekaComponent instances
   */
  frames: Frame[];

  /**
   * The primary State data structure. Changes to the State will cause all Frames to recompute their output View
   */
  declare state: t.State;

  /// @internal
  declare head: Head;

  private declare observer: Observer<t.State>;
  private declare extensions: ExtensionRegistry;

  private idToFrame: Map<string, Frame> = new Map();

  private init = false;

  loaded = false;

  externals: Externals;

  volatile: {
    [key: string]: any;
    [ExtensionVolatileStateKey]: Record<string, any>;
    [ExternalVolatileStateKey]: Record<string, any>;
  };

  constructor(private readonly opts?: RekaOpts) {
    this.id = getRandomId();

    this.frames = [];

    this.volatile = {
      [ExtensionVolatileStateKey]: {},
      [ExternalVolatileStateKey]: {},
    };

    this.externals = new Externals(this, opts?.externals);

    makeObservable(this, {
      frames: observable,
      volatile: observable,
      components: computed,
      dispose: action,
    });
  }

  getExternalState(key: string) {
    return this.externals.getStateValue(key);
  }

  getVolatileState(key: string) {
    return this.volatile[key];
  }

  updateVolatileState(key: string, value: any) {
    this.change(() => {
      this.volatile[key] = value;
    });
  }

  updateExternalState(key: string, value: any) {
    this.change(() => {
      this.externals.updateStateValue(key, value);
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
   *
   * @param state The State data type to load
   * @param syncImmediately Whether to sync changes made to the State to all active Frames immediately
   * @param evaluateImmediately Whether to evaluate Frames immediately or defer through a microtask
   */
  load(
    state: t.State,
    syncImmediately: boolean = true,
    evaluateImmediately?: boolean
  ) {
    if (this.loaded) {
      this.dispose();
    }

    this.init = true;
    this.state = t.state(state);
    this.head = new Head(this);
    this.observer = new Observer(this.state, {
      id: 'state-observer',
      hooks: {
        onDispose: (payload) => {
          if (!t.is(payload.type, t.ASTNode)) {
            return;
          }

          this.head.resolver.cleanupDisposedNode(payload.type);
        },
      },
    });

    this.frames = [];

    this.extensions = new ExtensionRegistry(this, this.opts?.extensions ?? []);

    this.extensions.init();

    if (syncImmediately) {
      this.sync(evaluateImmediately);
    } else {
      this.head.sync();
    }

    this.init = false;
    this.loaded = true;
  }

  /**
   * Sync changes made to the State to all active Frames. You usually do not need to call this manually
   *
   * @param evaluateImmediately Whether to evaluate Frames immediately or defer through a microtask
   */
  sync(evaluateImmediately?: boolean) {
    this.head.sync();

    return Promise.all(
      this.frames.map((frame) => {
        return frame.compute(evaluateImmediately);
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
   *
   * @param opts The Frame options
   * @param evaluateImmediately Whether to evaluate Frames immediately or defer through a microtask
   */
  async createFrame(opts: FrameOpts, evaluateImmediately?: boolean) {
    const frame = new Frame(opts, this);

    invariant(
      !this.idToFrame.get(frame.id),
      `An existing frame with id "${frame.id}" already exists!`
    );

    this.idToFrame.set(frame.id, frame);

    this.frames.push(frame);

    if (!this.init) {
      await frame.compute(evaluateImmediately);
    }

    return frame;
  }

  /**
   * Remove an existing Frame instance
   */
  removeFrame(frame: Frame) {
    frame.dispose();

    this.frames.splice(this.frames.indexOf(frame), 1);

    if (!frame.id) {
      return;
    }

    this.idToFrame.delete(frame.id);
  }

  /**
   * Get a Frame instance by its id
   */
  getFrame(id: string) {
    return this.idToFrame.get(id);
  }

  /**
   * Get an Extension's state from its definition
   */
  getExtension<D extends ExtensionDefinition<any>>(definition: D) {
    return this.extensions.getExtensionFromDefinition(definition);
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
    onCollect: (collected: C, prevCollected?: C) => void,
    opts?: StateSubscriberOpts
  ) {
    const dispose = reaction(
      () => collect(this),
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
  watch(cb: () => void) {
    const disposer = autorun(() => {
      cb();
    });

    return () => {
      disposer();
    };
  }

  get createCachedQuery() {
    return computedFn.bind(this);
  }

  /**
   * Dispose instance, stops all future computations
   */
  dispose() {
    this.loaded = false;
    this.frames.map((frame) => this.removeFrame(frame));

    this.head.dispose();
    this.observer.dispose();
    this.extensions.dispose();
  }

  toJSON() {
    return this.state;
  }

  get getVariablesAtNode() {
    return this.head.resolver.getVariablesAtNode.bind(this.head.resolver);
  }

  get getVariableFromIdentifier() {
    return this.head.resolver.getVariableFromIdentifier.bind(
      this.head.resolver
    );
  }

  /**
   * Create a new Reka instance
   */
  static create(opts?: RekaOpts) {
    return new Reka(opts);
  }
}
