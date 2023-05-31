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

import { ExtensionDefinition, ExtensionRegistry } from './extension';
import { Externals } from './externals';
import { Frame, FrameOpts } from './frame';
import { Head } from './head';
import { StateOpts, StateSubscriberOpts } from './interfaces';
import { ChangeListenerSubscriber, Observer } from './observer';

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
  private loaded = false;

  externals: Externals;

  constructor(private readonly opts?: StateOpts) {
    this.id = getRandomId();

    this.frames = [];

    this.externals = new Externals(this, opts?.externals);

    makeObservable(this, {
      frames: observable,
      components: computed,
      dispose: action,
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
          if (payload.type instanceof t.Identifier) {
            this.head.resolver.removeDistance(payload.type);
          }
        },
      },
    });

    this.frames = [];

    this.extensions = new ExtensionRegistry(this, this.opts?.extensions ?? []);

    this.extensions.init();

    if (syncImmediately) {
      this.sync();
    } else {
      this.head.sync();
    }

    this.init = false;
    this.loaded = true;
  }

  /**
   * Sync changes made to the State to all active Frames. You usually do not need to call this manually
   */
  sync() {
    this.head.sync();

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

    invariant(
      !this.idToFrame.get(frame.id),
      `An existing frame with id "${frame.id}" already exists!`
    );

    this.idToFrame.set(frame.id, frame);

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

  /**
   * Dispose instance, stops all future computations
   */
  dispose() {
    this.frames.map((frame) => this.removeFrame(frame));

    this.head.dispose();
    this.observer.dispose();
    this.extensions.dispose();
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
