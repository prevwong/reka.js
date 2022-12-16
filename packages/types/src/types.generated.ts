import { Schema, Type } from './schema';

type ExpressionParameters = {};

export abstract class Expression extends Type {
  constructor(type: string, value: ExpressionParameters) {
    super(type, value);
  }
}

Schema.register('Expression', Expression);

type LiteralParameters = {
  value: string | number | boolean;
};

export class Literal extends Expression {
  declare value: string | number | boolean;
  constructor(value: LiteralParameters) {
    super('Literal', value);
  }
}

Schema.register('Literal', Literal);

export const literal = (...args: ConstructorParameters<typeof Literal>) =>
  new Literal(...args);

type IdentifierParameters = {
  name: string;
};

export class Identifier extends Expression {
  declare name: string;
  constructor(value: IdentifierParameters) {
    super('Identifier', value);
  }
}

Schema.register('Identifier', Identifier);

export const identifier = (...args: ConstructorParameters<typeof Identifier>) =>
  new Identifier(...args);

type ValParameters = {
  name: string;
  init: Expression;
};

export class Val extends Expression {
  declare name: string;
  declare init: Expression;
  constructor(value: ValParameters) {
    super('Val', value);
  }
}

Schema.register('Val', Val);

export const val = (...args: ConstructorParameters<typeof Val>) =>
  new Val(...args);

type ArrayExpressionParameters = {
  elements: Expression[];
};

export class ArrayExpression extends Expression {
  declare elements: Expression[];
  constructor(value: ArrayExpressionParameters) {
    super('ArrayExpression', value);
  }
}

Schema.register('ArrayExpression', ArrayExpression);

export const arrayExpression = (
  ...args: ConstructorParameters<typeof ArrayExpression>
) => new ArrayExpression(...args);

type BinaryExpressionParameters = {
  left: Expression;
  operator: '+' | '-' | '*' | '/' | '!=' | '==' | '<' | '<=' | '>' | '>=';
  right: Expression;
};

export class BinaryExpression extends Expression {
  declare left: Expression;
  declare operator:
    | '+'
    | '-'
    | '*'
    | '/'
    | '!='
    | '=='
    | '<'
    | '<='
    | '>'
    | '>=';
  declare right: Expression;
  constructor(value: BinaryExpressionParameters) {
    super('BinaryExpression', value);
  }
}

Schema.register('BinaryExpression', BinaryExpression);

export const binaryExpression = (
  ...args: ConstructorParameters<typeof BinaryExpression>
) => new BinaryExpression(...args);

type ObjectExpressionParameters = {
  properties: Record<string, Expression>;
};

export class ObjectExpression extends Expression {
  declare properties: Record<string, Expression>;
  constructor(value: ObjectExpressionParameters) {
    super('ObjectExpression', value);
  }
}

Schema.register('ObjectExpression', ObjectExpression);

export const objectExpression = (
  ...args: ConstructorParameters<typeof ObjectExpression>
) => new ObjectExpression(...args);

type ComponentPropParameters = {
  name: string;
  init?: Expression | null;
};

export class ComponentProp extends Type {
  declare name: string;
  declare init: Expression | null;
  constructor(value: ComponentPropParameters) {
    super('ComponentProp', value);
  }
}

Schema.register('ComponentProp', ComponentProp);

export const componentProp = (
  ...args: ConstructorParameters<typeof ComponentProp>
) => new ComponentProp(...args);

type ComponentParameters = {
  name: string;
};

export abstract class Component extends Type {
  declare name: string;
  constructor(type: string, value: ComponentParameters) {
    super(type, value);
  }
}

Schema.register('Component', Component);

type CompositeComponentParameters = {
  name: string;
  template: Template;
  state: Val[];
  props: ComponentProp[];
};

export class CompositeComponent extends Component {
  declare template: Template;
  declare state: Val[];
  declare props: ComponentProp[];
  constructor(value: CompositeComponentParameters) {
    super('CompositeComponent', value);
  }
}

Schema.register('CompositeComponent', CompositeComponent);

export const compositeComponent = (
  ...args: ConstructorParameters<typeof CompositeComponent>
) => new CompositeComponent(...args);

type ExternalComponentParameters = {
  name: string;
  render: Function;
};

export class ExternalComponent extends Component {
  declare render: Function;
  constructor(value: ExternalComponentParameters) {
    super('ExternalComponent', value);
  }
}

Schema.register('ExternalComponent', ExternalComponent);

export const externalComponent = (
  ...args: ConstructorParameters<typeof ExternalComponent>
) => new ExternalComponent(...args);

type ElementEachParameters = {
  alias: Identifier;
  index?: Identifier | null;
  iterator: Identifier;
};

export class ElementEach extends Type {
  declare alias: Identifier;
  declare index: Identifier | null;
  declare iterator: Identifier;
  constructor(value: ElementEachParameters) {
    super('ElementEach', value);
  }
}

Schema.register('ElementEach', ElementEach);

export const elementEach = (
  ...args: ConstructorParameters<typeof ElementEach>
) => new ElementEach(...args);

type TemplateParameters = {
  props: Record<string, Expression>;
  children: Template[];
  if?: Expression | null;
  each?: ElementEach | null;
  classList?: ObjectExpression | null;
};

export abstract class Template extends Type {
  declare props: Record<string, Expression>;
  declare children: Template[];
  declare if: Expression | null;
  declare each: ElementEach | null;
  declare classList: ObjectExpression | null;
  constructor(type: string, value: TemplateParameters) {
    super(type, value);
  }
}

Schema.register('Template', Template);

type TagTemplateParameters = {
  props: Record<string, Expression>;
  children: Template[];
  if?: Expression | null;
  each?: ElementEach | null;
  classList?: ObjectExpression | null;
  tag: string;
};

export class TagTemplate extends Template {
  declare tag: string;
  constructor(value: TagTemplateParameters) {
    super('TagTemplate', value);
  }
}

Schema.register('TagTemplate', TagTemplate);

export const tagTemplate = (
  ...args: ConstructorParameters<typeof TagTemplate>
) => new TagTemplate(...args);

type ComponentTemplateParameters = {
  props: Record<string, Expression>;
  children: Template[];
  if?: Expression | null;
  each?: ElementEach | null;
  classList?: ObjectExpression | null;
  component: Identifier;
};

export class ComponentTemplate extends Template {
  declare component: Identifier;
  constructor(value: ComponentTemplateParameters) {
    super('ComponentTemplate', value);
  }
}

Schema.register('ComponentTemplate', ComponentTemplate);

export const componentTemplate = (
  ...args: ConstructorParameters<typeof ComponentTemplate>
) => new ComponentTemplate(...args);

type SlotTemplateParameters = {
  props: Record<string, Expression>;
  children: Template[];
  if?: Expression | null;
  each?: ElementEach | null;
  classList?: ObjectExpression | null;
};

export class SlotTemplate extends Template {
  constructor(value: SlotTemplateParameters) {
    super('SlotTemplate', value);
  }
}

Schema.register('SlotTemplate', SlotTemplate);

export const slotTemplate = (
  ...args: ConstructorParameters<typeof SlotTemplate>
) => new SlotTemplate(...args);

type MemberExpressionParameters = {
  object: Identifier | MemberExpression;
  property: Identifier;
};

export class MemberExpression extends Expression {
  declare object: Identifier | MemberExpression;
  declare property: Identifier;
  constructor(value: MemberExpressionParameters) {
    super('MemberExpression', value);
  }
}

Schema.register('MemberExpression', MemberExpression);

export const memberExpression = (
  ...args: ConstructorParameters<typeof MemberExpression>
) => new MemberExpression(...args);

type FuncParameters = {
  name?: string | null;
  params: Identifier[];
  body: Block;
};

export class Func extends Expression {
  declare name: string | null;
  declare params: Identifier[];
  declare body: Block;
  constructor(value: FuncParameters) {
    super('Func', value);
  }
}

Schema.register('Func', Func);

export const func = (...args: ConstructorParameters<typeof Func>) =>
  new Func(...args);

type AssignmentParameters = {
  left: Identifier;
  operator: '=' | '+=' | '-=';
  right: Expression;
};

export class Assignment extends Type {
  declare left: Identifier;
  declare operator: '=' | '+=' | '-=';
  declare right: Expression;
  constructor(value: AssignmentParameters) {
    super('Assignment', value);
  }
}

Schema.register('Assignment', Assignment);

export const assignment = (...args: ConstructorParameters<typeof Assignment>) =>
  new Assignment(...args);

type StateParameters = {
  program: Program;
  extensions: Record<string, ExtensionState>;
};

export class State extends Type {
  declare program: Program;
  declare extensions: Record<string, ExtensionState>;
  constructor(value: StateParameters) {
    super('State', value);
  }
}

Schema.register('State', State);

export const state = (...args: ConstructorParameters<typeof State>) =>
  new State(...args);

type ProgramParameters = {
  globals: Val[];
  components: CompositeComponent[];
};

export class Program extends Type {
  declare globals: Val[];
  declare components: CompositeComponent[];
  constructor(value: ProgramParameters) {
    super('Program', value);
  }
}

Schema.register('Program', Program);

export const program = (...args: ConstructorParameters<typeof Program>) =>
  new Program(...args);

type ViewParameters = {
  key: string;
  template: Template;
};

export abstract class View extends Type {
  declare key: string;
  declare template: Template;
  constructor(type: string, value: ViewParameters) {
    super(type, value);
  }
}

Schema.register('View', View);

type ElementViewParameters = {
  key: string;
  template: Template;
  tag: string;
  children: View[];
  props: Record<string, string | number | boolean | Function | undefined>;
};

export class ElementView extends View {
  declare tag: string;
  declare children: View[];
  declare props: Record<
    string,
    string | number | boolean | Function | undefined
  >;
  constructor(value: ElementViewParameters) {
    super('ElementView', value);
  }
}

Schema.register('ElementView', ElementView);

export const elementView = (
  ...args: ConstructorParameters<typeof ElementView>
) => new ElementView(...args);

type ComponentViewParameters = {
  key: string;
  template: Template;
  component: Component;
};

export abstract class ComponentView extends View {
  declare component: Component;
  constructor(type: string, value: ComponentViewParameters) {
    super(type, value);
  }
}

Schema.register('ComponentView', ComponentView);

type CompositeComponentViewParameters = {
  key: string;
  template: Template;
  component: Component;
  render: View[];
};

export class CompositeComponentView extends ComponentView {
  declare render: View[];
  constructor(value: CompositeComponentViewParameters) {
    super('CompositeComponentView', value);
  }
}

Schema.register('CompositeComponentView', CompositeComponentView);

export const compositeComponentView = (
  ...args: ConstructorParameters<typeof CompositeComponentView>
) => new CompositeComponentView(...args);

type ExternalComponentViewParameters = {
  key: string;
  template: Template;
  component: ExternalComponent;
  props: Record<string, string | number | boolean | Function>;
};

export class ExternalComponentView extends ComponentView {
  declare component: ExternalComponent;
  declare props: Record<string, string | number | boolean | Function>;
  constructor(value: ExternalComponentViewParameters) {
    super('ExternalComponentView', value);
  }
}

Schema.register('ExternalComponentView', ExternalComponentView);

export const externalComponentView = (
  ...args: ConstructorParameters<typeof ExternalComponentView>
) => new ExternalComponentView(...args);

type SlotViewParameters = {
  key: string;
  template: Template;
  view: View[];
};

export class SlotView extends View {
  declare view: View[];
  constructor(value: SlotViewParameters) {
    super('SlotView', value);
  }
}

Schema.register('SlotView', SlotView);

export const slotView = (...args: ConstructorParameters<typeof SlotView>) =>
  new SlotView(...args);

type SystemViewParameters = {
  key: string;
  template: Template;
};

export abstract class SystemView extends View {
  constructor(type: string, value: SystemViewParameters) {
    super(type, value);
  }
}

Schema.register('SystemView', SystemView);

type EachSystemViewParameters = {
  key: string;
  template: Template;
  children: View[];
};

export class EachSystemView extends SystemView {
  declare children: View[];
  constructor(value: EachSystemViewParameters) {
    super('EachSystemView', value);
  }
}

Schema.register('EachSystemView', EachSystemView);

export const eachSystemView = (
  ...args: ConstructorParameters<typeof EachSystemView>
) => new EachSystemView(...args);

type ErrorSystemViewParameters = {
  key: string;
  template: Template;
  error: string;
};

export class ErrorSystemView extends SystemView {
  declare error: string;
  constructor(value: ErrorSystemViewParameters) {
    super('ErrorSystemView', value);
  }
}

Schema.register('ErrorSystemView', ErrorSystemView);

export const errorSystemView = (
  ...args: ConstructorParameters<typeof ErrorSystemView>
) => new ErrorSystemView(...args);

type BlockParameters = {
  statements: Statement[];
};

export class Block extends Expression {
  declare statements: Statement[];
  constructor(value: BlockParameters) {
    super('Block', value);
  }
}

Schema.register('Block', Block);

export const block = (...args: ConstructorParameters<typeof Block>) =>
  new Block(...args);

type ExtensionStateParameters = {
  value: null | Record<string, any>;
};

export class ExtensionState extends Type {
  declare value: null | Record<string, any>;
  constructor(value: ExtensionStateParameters) {
    super('ExtensionState', value);
  }
}

Schema.register('ExtensionState', ExtensionState);

export const extensionState = (
  ...args: ConstructorParameters<typeof ExtensionState>
) => new ExtensionState(...args);
export type Statement = Assignment;
export type Any =
  | Expression
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
  Expression: (node: Expression) => any;
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
