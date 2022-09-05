/* eslint-disable @typescript-eslint/ban-types */
import { Schema, Type, TypeProperties } from "./schema";

export class Literal extends Type {
  declare value: string | number | boolean;
  constructor(value: TypeProperties<Literal>) {
    super("Literal", value);
  }
}

Schema.register("Literal", Literal);

export const literal = (...args: ConstructorParameters<typeof Literal>) =>
  new Literal(...args);

export class Identifier extends Type {
  declare name: string;
  constructor(value: TypeProperties<Identifier>) {
    super("Identifier", value);
  }
}

Schema.register("Identifier", Identifier);

export const identifier = (...args: ConstructorParameters<typeof Identifier>) =>
  new Identifier(...args);

export class Val extends Type {
  declare name: string;
  declare init: Expression;
  constructor(value: TypeProperties<Val>) {
    super("Val", value);
  }
}

Schema.register("Val", Val);

export const val = (...args: ConstructorParameters<typeof Val>) =>
  new Val(...args);

export class ArrayExpression extends Type {
  declare elements: Expression[];
  constructor(value: TypeProperties<ArrayExpression>) {
    super("ArrayExpression", value);
  }
}

Schema.register("ArrayExpression", ArrayExpression);

export const arrayExpression = (
  ...args: ConstructorParameters<typeof ArrayExpression>
) => new ArrayExpression(...args);

export class BinaryExpression extends Type {
  declare left: Expression;
  declare operator:
    | "+"
    | "-"
    | "*"
    | "/"
    | "!="
    | "=="
    | "<"
    | "<="
    | ">"
    | ">=";
  declare right: Expression;
  constructor(value: TypeProperties<BinaryExpression>) {
    super("BinaryExpression", value);
  }
}

Schema.register("BinaryExpression", BinaryExpression);

export const binaryExpression = (
  ...args: ConstructorParameters<typeof BinaryExpression>
) => new BinaryExpression(...args);

export class ObjectExpression extends Type {
  declare properties: Record<string, Expression>;
  constructor(value: TypeProperties<ObjectExpression>) {
    super("ObjectExpression", value);
  }
}

Schema.register("ObjectExpression", ObjectExpression);

export const objectExpression = (
  ...args: ConstructorParameters<typeof ObjectExpression>
) => new ObjectExpression(...args);

export class ComponentProp extends Type {
  declare name: string;
  constructor(value: TypeProperties<ComponentProp>) {
    super("ComponentProp", value);
  }
}

Schema.register("ComponentProp", ComponentProp);

export const componentProp = (
  ...args: ConstructorParameters<typeof ComponentProp>
) => new ComponentProp(...args);

export abstract class Component extends Type {
  declare name: string;
  constructor(type: string, value: TypeProperties<Component>) {
    super(type, value);
  }
}

Schema.register("Component", Component);

export class CompositeComponent extends Component {
  declare template: Template;
  declare state: Val[];
  declare props: ComponentProp[];
  constructor(value: TypeProperties<CompositeComponent>) {
    super("CompositeComponent", value);
  }
}

Schema.register("CompositeComponent", CompositeComponent);

export const compositeComponent = (
  ...args: ConstructorParameters<typeof CompositeComponent>
) => new CompositeComponent(...args);

export class ExternalComponent extends Component {
  declare render: Function;
  constructor(value: TypeProperties<ExternalComponent>) {
    super("ExternalComponent", value);
  }
}

Schema.register("ExternalComponent", ExternalComponent);

export const externalComponent = (
  ...args: ConstructorParameters<typeof ExternalComponent>
) => new ExternalComponent(...args);

export class ElementEach extends Type {
  declare alias: Identifier;
  declare index?: Identifier;
  declare iterator: Identifier;
  constructor(value: TypeProperties<ElementEach>) {
    super("ElementEach", value);
  }
}

Schema.register("ElementEach", ElementEach);

export const elementEach = (
  ...args: ConstructorParameters<typeof ElementEach>
) => new ElementEach(...args);

export abstract class Template extends Type {
  declare props: Record<string, Expression>;
  declare children: Template[];
  declare if?: Expression;
  declare each?: ElementEach;
  constructor(type: string, value: TypeProperties<Template>) {
    super(type, value);
  }
}

Schema.register("Template", Template);

export class TagTemplate extends Template {
  declare tag: string;
  constructor(value: TypeProperties<TagTemplate>) {
    super("TagTemplate", value);
  }
}

Schema.register("TagTemplate", TagTemplate);

export const tagTemplate = (
  ...args: ConstructorParameters<typeof TagTemplate>
) => new TagTemplate(...args);

export class ComponentTemplate extends Template {
  declare component: Identifier;
  constructor(value: TypeProperties<ComponentTemplate>) {
    super("ComponentTemplate", value);
  }
}

Schema.register("ComponentTemplate", ComponentTemplate);

export const componentTemplate = (
  ...args: ConstructorParameters<typeof ComponentTemplate>
) => new ComponentTemplate(...args);

export class SlotTemplate extends Template {
  constructor(value: TypeProperties<SlotTemplate>) {
    super("SlotTemplate", value);
  }
}

Schema.register("SlotTemplate", SlotTemplate);

export const slotTemplate = (
  ...args: ConstructorParameters<typeof SlotTemplate>
) => new SlotTemplate(...args);

export class MemberExpression extends Type {
  declare object: Identifier | MemberExpression;
  declare property: Identifier;
  constructor(value: TypeProperties<MemberExpression>) {
    super("MemberExpression", value);
  }
}

Schema.register("MemberExpression", MemberExpression);

export const memberExpression = (
  ...args: ConstructorParameters<typeof MemberExpression>
) => new MemberExpression(...args);

export class Func extends Type {
  declare name?: string;
  declare params: Identifier[];
  declare body: Block;
  constructor(value: TypeProperties<Func>) {
    super("Func", value);
  }
}

Schema.register("Func", Func);

export const func = (...args: ConstructorParameters<typeof Func>) =>
  new Func(...args);

export class Assignment extends Type {
  declare left: Identifier;
  declare operator: "=" | "+=" | "-=";
  declare right: Expression;
  constructor(value: TypeProperties<Assignment>) {
    super("Assignment", value);
  }
}

Schema.register("Assignment", Assignment);

export const assignment = (...args: ConstructorParameters<typeof Assignment>) =>
  new Assignment(...args);

export class State extends Type {
  declare program: Program;
  declare extensions: ExtensionState[];
  constructor(value: TypeProperties<State>) {
    super("State", value);
  }
}

Schema.register("State", State);

export const state = (...args: ConstructorParameters<typeof State>) =>
  new State(...args);

export class Program extends Type {
  declare globals: Val[];
  declare components: CompositeComponent[];
  constructor(value: TypeProperties<Program>) {
    super("Program", value);
  }
}

Schema.register("Program", Program);

export const program = (...args: ConstructorParameters<typeof Program>) =>
  new Program(...args);

export abstract class View extends Type {
  declare key: string;
  declare template: Template;
  constructor(type: string, value: TypeProperties<View>) {
    super(type, value);
  }
}

Schema.register("View", View);

export class ElementView extends View {
  declare tag: string;
  declare children: View[];
  declare props: Record<string, string | number | boolean | Function>;
  constructor(value: TypeProperties<ElementView>) {
    super("ElementView", value);
  }
}

Schema.register("ElementView", ElementView);

export const elementView = (
  ...args: ConstructorParameters<typeof ElementView>
) => new ElementView(...args);

export abstract class ComponentView extends View {
  declare component: Component;
  constructor(type: string, value: TypeProperties<ComponentView>) {
    super(type, value);
  }
}

Schema.register("ComponentView", ComponentView);

export class CompositeComponentView extends ComponentView {
  declare render: View[];
  constructor(value: TypeProperties<CompositeComponentView>) {
    super("CompositeComponentView", value);
  }
}

Schema.register("CompositeComponentView", CompositeComponentView);

export const compositeComponentView = (
  ...args: ConstructorParameters<typeof CompositeComponentView>
) => new CompositeComponentView(...args);

export class ExternalComponentView extends ComponentView {
  declare component: ExternalComponent;
  declare props: Record<string, string | number | boolean | Function>;
  constructor(value: TypeProperties<ExternalComponentView>) {
    super("ExternalComponentView", value);
  }
}

Schema.register("ExternalComponentView", ExternalComponentView);

export const externalComponentView = (
  ...args: ConstructorParameters<typeof ExternalComponentView>
) => new ExternalComponentView(...args);

export class SlotView extends View {
  declare view: View[];
  constructor(value: TypeProperties<SlotView>) {
    super("SlotView", value);
  }
}

Schema.register("SlotView", SlotView);

export const slotView = (...args: ConstructorParameters<typeof SlotView>) =>
  new SlotView(...args);

export abstract class SystemView extends View {
  constructor(type: string, value: TypeProperties<SystemView>) {
    super(type, value);
  }
}

Schema.register("SystemView", SystemView);

export class EachSystemView extends SystemView {
  declare children: View[];
  constructor(value: TypeProperties<EachSystemView>) {
    super("EachSystemView", value);
  }
}

Schema.register("EachSystemView", EachSystemView);

export const eachSystemView = (
  ...args: ConstructorParameters<typeof EachSystemView>
) => new EachSystemView(...args);

export class ErrorSystemView extends SystemView {
  declare error: string;
  constructor(value: TypeProperties<ErrorSystemView>) {
    super("ErrorSystemView", value);
  }
}

Schema.register("ErrorSystemView", ErrorSystemView);

export const errorSystemView = (
  ...args: ConstructorParameters<typeof ErrorSystemView>
) => new ErrorSystemView(...args);

export class Block extends Type {
  declare statements: Statement[];
  constructor(value: TypeProperties<Block>) {
    super("Block", value);
  }
}

Schema.register("Block", Block);

export const block = (...args: ConstructorParameters<typeof Block>) =>
  new Block(...args);

export class ExtensionState extends Type {
  declare value: null | Record<string, any>;
  constructor(value: TypeProperties<ExtensionState>) {
    super("ExtensionState", value);
  }
}

Schema.register("ExtensionState", ExtensionState);

export const extensionState = (
  ...args: ConstructorParameters<typeof ExtensionState>
) => new ExtensionState(...args);
export type Expression =
  | Literal
  | Identifier
  | Val
  | ArrayExpression
  | BinaryExpression
  | ObjectExpression
  | MemberExpression
  | Func
  | Block;
export type Statement = Assignment;
export type Any =
  | Literal
  | Identifier
  | Val
  | ArrayExpression
  | BinaryExpression
  | ObjectExpression
  | ComponentProp
  | Component
  | CompositeComponent
  | ExternalComponent
  | ElementEach
  | Template
  | TagTemplate
  | ComponentTemplate
  | SlotTemplate
  | MemberExpression
  | Func
  | Assignment
  | State
  | Program
  | View
  | ElementView
  | ComponentView
  | CompositeComponentView
  | ExternalComponentView
  | SlotView
  | SystemView
  | EachSystemView
  | ErrorSystemView
  | Block
  | ExtensionState;
export type Visitor = {
  Literal: (node: Literal) => any;
  Identifier: (node: Identifier) => any;
  Val: (node: Val) => any;
  ArrayExpression: (node: ArrayExpression) => any;
  BinaryExpression: (node: BinaryExpression) => any;
  ObjectExpression: (node: ObjectExpression) => any;
  ComponentProp: (node: ComponentProp) => any;
  Component: (node: Component) => any;
  CompositeComponent: (node: CompositeComponent) => any;
  ExternalComponent: (node: ExternalComponent) => any;
  ElementEach: (node: ElementEach) => any;
  Template: (node: Template) => any;
  TagTemplate: (node: TagTemplate) => any;
  ComponentTemplate: (node: ComponentTemplate) => any;
  SlotTemplate: (node: SlotTemplate) => any;
  MemberExpression: (node: MemberExpression) => any;
  Func: (node: Func) => any;
  Assignment: (node: Assignment) => any;
  State: (node: State) => any;
  Program: (node: Program) => any;
  View: (node: View) => any;
  ElementView: (node: ElementView) => any;
  ComponentView: (node: ComponentView) => any;
  CompositeComponentView: (node: CompositeComponentView) => any;
  ExternalComponentView: (node: ExternalComponentView) => any;
  SlotView: (node: SlotView) => any;
  SystemView: (node: SystemView) => any;
  EachSystemView: (node: EachSystemView) => any;
  ErrorSystemView: (node: ErrorSystemView) => any;
  Block: (node: Block) => any;
  ExtensionState: (node: ExtensionState) => any;
};
