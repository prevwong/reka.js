import * as t from "@composite/types";

type ExtensionState = Record<string, any>;

type ExtensionConfig<S extends ExtensionState> = {
  state: S;
  components: t.Component[];
  globals: Record<string, any>;
};

export class Extension<S extends ExtensionState> {
  state: S;
  components: t.Component[];
  globals: Record<string, any>;

  constructor(config: ExtensionConfig<S>) {
    this.state = config.state;
    this.components = config.components;
    this.globals = config.globals;
  }
}

export type ExtensionCtor = new (...args: any[]) => Extension<any>;

export const createExtension = <S extends ExtensionState>(
  config: ExtensionConfig<S>
) => {
  return new Extension(config);
};
