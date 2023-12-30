import * as t from '@rekajs/types';
import { getRandomId, invariant } from '@rekajs/utils';
import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from 'mobx';
import { computedFn } from 'mobx-utils';

import { ExtensionDefinition, ExtensionRegistry } from './extension';
import { Externals } from './externals';
import { Frame, FrameOpts } from './frame';
import { Head } from './head';
import { DefaultHistoryManager, HistoryManager } from './history';
import {
  CustomKindDefinition,
  RekaChangeOpts,
  RekaChangesetInfo,
  RekaOpts,
  RekaStateChangeset,
  StateSubscriberOpts,
} from './interfaces';
import {
  ChangeListenerSubscriber,
  ChangeOpts,
  Observer,
  ChangesetListener,
} from './observer';
import { ExtensionVolatileStateKey, ExternalVolatileStateKey } from './symbols';
import { KindFieldValidators } from './utils';

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

  private declare kinds: Record<string, CustomKindDefinition>;

  private declare observer: Observer<t.State>;
  private declare extensions: ExtensionRegistry;
  private declare _history: HistoryManager;

  private idToFrame: Map<string, Frame> = new Map();

  private init = false;

  loaded = false;

  externals: Externals;

  changes: any[];

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

    this.createCustomKindsDefinition();

    this.externals = new Externals(this, opts?.externals);

    this.changes = [];

    makeObservable(this, {
      frames: observable,
      volatile: observable,
      components: computed,
      dispose: action,
      changes: observable,
    });
  }

  set history(manager: HistoryManager) {
    invariant(
      !this.loaded,
      `Cannot override History manager after Reka has been initialised.`
    );

    this._history = manager;
  }

  get history() {
    invariant(this._history, `History manager not initialised.`);

    return this._history;
  }

  canUndo() {
    return this.history.status.undoable;
  }

  canRedo() {
    return this.history.status.redoable;
  }

  undo() {
    return this._history.undo();
  }

  redo() {
    return this.history.redo();
  }

  private createCustomKindsDefinition() {
    if (!this.opts || !this.opts.kinds) {
      return;
    }

    const kinds = this.opts.kinds;

    this.kinds = Object.keys(kinds).reduce((accum, name) => {
      // Validate Custom kind names
      invariant(
        name[0] === name[0].toUpperCase(),
        `Custom kind "${name}" must start with a capital letter.`
      );

      accum[name] = {
        fallback: kinds[name].fallback ?? '',
        validator: kinds[name].validate(KindFieldValidators),
      };

      return accum;
    }, {});
  }

  getCustomKind(name: string) {
    return this.kinds[name] ?? null;
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
    evaluateImmediately: boolean = false
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

    this.history = new DefaultHistoryManager(this);

    this.frames = [];

    this.extensions = new ExtensionRegistry(this, this.opts?.extensions ?? []);

    this.extensions.init();

    this.history.init?.();

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
  sync(evaluateImmediately: boolean = false) {
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
  change(mutator: () => void, opts?: Partial<RekaChangeOpts>) {
    return runInAction(() => {
      this.observer.change(mutator, {
        source: opts?.source,
        info: {
          ...(opts?.info ?? {}),
          history: {
            ignore: false,
            throttle: 0,
            ...(opts?.history ?? {}),
          },
        },
      });

      // Don't sync yet when we're still setting up (ie: creating the Extensions registry)
      if (this.init) {
        return;
      }

      return this.sync();
    });
  }

  /**
   * Create a new Frame instance
   */
  async createFrame(opts: FrameOpts) {
    const frame = new Frame(opts, this);

    invariant(
      !this.idToFrame.get(frame.id),
      `An existing frame with id "${frame.id}" already exists!`
    );

    this.idToFrame.set(frame.id, frame);

    this.frames.push(frame);

    if (!this.init) {
      await frame.compute(opts.evaluateImmediately);
    }

    return frame;
  }

  /**
   * Remove an existing Frame instance
   */
  removeFrame(frame: Frame) {
    if (this.history.dispose) {
      this.history.dispose();
    }

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
   * @deprecated Use listenToChangeset()
   *
   * Listen for changes and mutations made to the State
   */
  listenToChanges(changeListenerSubscriber: ChangeListenerSubscriber) {
    return this.observer.listenToChanges(changeListenerSubscriber);
  }

  /**
   * Listen for changes and mutations made to the State
   */
  listenToChangeset(subscriber: ChangesetListener<RekaChangesetInfo>) {
    return this.observer.listenToChangeset(subscriber);
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

  get getIdentifiablesAtNode() {
    return this.head.resolver.getIdentifiablesAtNode.bind(this.head.resolver);
  }

  get getIdentifiableFromIdentifier() {
    return this.head.resolver.getIdentifiableFromIdentifier.bind(
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
