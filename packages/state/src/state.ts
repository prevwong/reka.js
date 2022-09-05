import * as t from '@composite/types';
import { computed, IComputedValue, makeObservable, runInAction } from 'mobx';
import { Environment } from './environment';
import { computeExpression } from './expression';
import { Extension } from './extension';
import { Frame, FrameOpts } from './frame';
import { Observer } from './observer';
import { Resolver } from './resolver';

type StateOpts = {
  data: t.Program;
  components?: t.Component[];
  globals?: Record<string, any>;

  extensions?: Extension<any>[];
};

type StateConfig = {
  globals: Record<string, any>;
  components?: t.Component[];
};

export class State {
  env: Environment;
  resolver: Resolver;
  frames: Frame[];
  state: t.State;

  private observer: Observer<t.State>;
  private syncGlobals: IComputedValue<void> | null = null;
  private syncComponents: IComputedValue<void> | null = null;
  private syncCleanupEnv: IComputedValue<void> | null = null;
  private extensions: Set<Extension<any>>;
  private extensionToIndex: WeakMap<Extension<any>, number> = new WeakMap();
  private idToFrame: Map<string, Frame> = new Map();

  constructor(private readonly opts: StateOpts) {
    this.state = t.state({
      program: opts.data,
      extensions: [],
    });

    this.extensions = new Set(this.opts.extensions || []);
    this.extensions.forEach((extension) => {
      if (!extension.state) {
        return;
      }

      this.state.extensions.push(
        t.extensionState({
          value: extension.state,
        })
      );

      this.extensionToIndex.set(extension, this.state.extensions.length - 1);
    });

    this.observer = new Observer(this.state, this.observerConfig);
    this.env = new Environment(this);
    this.resolver = new Resolver(this);
    this.frames = [];

    makeObservable(this, {
      config: computed,
      allComponents: computed,
    });

    this.sync();
  }

  getExtensionState<E extends Extension<any>>(extension: E) {
    const index = this.extensionToIndex.get(extension);

    if (index === undefined) {
      throw new Error();
    }

    return this.state.extensions[index].value as E['state'];
  }

  get config(): StateConfig {
    const config = {
      globals: this.opts.globals || {},
      components: this.opts.components || [],
    };

    this.extensions.forEach((extension) => {
      Object.assign(config.globals, extension.globals);
      config.components.push(...extension.components);
    });

    return config;
  }

  get root() {
    return this.state.program;
  }

  private get observerConfig() {
    return {
      hooks: {
        onDispose: (payload) => {
          if (payload.type instanceof t.Identifier) {
            this.resolver.identifiersToVariableDistance.delete(payload.type);
          }
        },
      },
    };
  }

  get allComponents() {
    return [...(this.config.components ?? []), ...this.root.components];
  }

  sync() {
    this.resolver.resolveProgram();

    if (!this.syncGlobals) {
      this.syncGlobals = computed(() => {
        Object.entries(this.config.globals).forEach(([key, value]) => {
          this.env.set(key, value);
        });

        this.root.globals.forEach((global) => {
          this.env.set(
            global.name,
            computeExpression(global.init, this as any, this.env)
          );
        });
      });
    }

    if (!this.syncComponents) {
      this.syncComponents = computed(() => {
        this.allComponents.forEach((component) => {
          this.env.set(component.name, component);
        });
      });
    }

    if (!this.syncCleanupEnv) {
      this.syncCleanupEnv = computed(() => {
        const globalVarNames = this.root.globals.map((global) => global.name);
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
      });
    }

    this.syncGlobals.get();
    this.syncComponents.get();
    this.syncCleanupEnv.get();

    this.frames.forEach((frame) => {
      frame.render();
    });
  }

  change(mutator: () => void) {
    runInAction(() => {
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

  replace(state: t.State) {
    this.state = state;
    this.observer.replace(this.state);

    this.env = new Environment(this);
    this.resolver = new Resolver(this);
    this.syncComponents = null;
    this.syncGlobals = null;
    this.syncCleanupEnv = null;
    this.frames.forEach((frame) => frame.hardRerender());
    this.sync();
  }

  getTypeFromId(id: string) {
    return this.observer.idToType.get(id);
  }

  getParentType(type: t.Type) {
    return this.observer.getParent(type);
  }

  subscribe(...args: Parameters<Observer<any>['subscribe']>) {
    return this.observer.subscribe(...args);
  }

  dispose() {
    this.observer.dispose();
  }
}
