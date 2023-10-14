import { Schema, Type } from '../schema';

type StateParameters = {
  program: Program;
  extensions?: Record<string, ExtensionState>;
};

export class State extends Type {
  declare program: Program;
  declare extensions: Record<string, ExtensionState>;
  constructor(value: StateParameters) {
    super('State', value);
  }
}

Schema.register('State', State);

type ASTNodeParameters = {
  meta?: Record<string, any>;
};

export abstract class ASTNode extends Type {
  declare meta: Record<string, any>;
  constructor(type: string, value: ASTNodeParameters) {
    super(type, value);
  }
}

Schema.register('ASTNode', ASTNode);

type ProgramParameters = {
  meta?: Record<string, any>;
  globals?: Val[];
  components?: RekaComponent[];
};

export class Program extends ASTNode {
  declare globals: Val[];
  declare components: RekaComponent[];
  constructor(value: ProgramParameters) {
    super('Program', value);
  }
}

Schema.register('Program', Program);

type KindParameters = {};

export abstract class Kind extends Type {
  constructor(type: string, value: KindParameters) {
    super(type, value);
  }
}

Schema.register('Kind', Kind);

type PrimitiveKindParameters = {
  primitive: 'string' | 'number' | 'boolean';
};

export class PrimitiveKind extends Kind {
  declare primitive: 'string' | 'number' | 'boolean';
  constructor(value: PrimitiveKindParameters) {
    super('PrimitiveKind', value);
  }
}

Schema.register('PrimitiveKind', PrimitiveKind);

type ArrayKindParameters = {
  kind: Kind;
};

export class ArrayKind extends Kind {
  declare kind: Kind;
  constructor(value: ArrayKindParameters) {
    super('ArrayKind', value);
  }
}

Schema.register('ArrayKind', ArrayKind);

type OptionKindParameters = {
  options: Record<string, string>;
};

export class OptionKind extends Kind {
  declare options: Record<string, string>;
  constructor(value: OptionKindParameters) {
    super('OptionKind', value);
  }
}

Schema.register('OptionKind', OptionKind);

type ExpressionParameters = {
  meta?: Record<string, any>;
};

export abstract class Expression extends ASTNode {
  constructor(type: string, value: ExpressionParameters) {
    super(type, value);
  }
}

Schema.register('Expression', Expression);

type VariableParameters = {
  meta?: Record<string, any>;
  name: string;
};

export abstract class Variable extends Expression {
  declare name: string;
  constructor(type: string, value: VariableParameters) {
    super(type, value);
  }
}

Schema.register('Variable', Variable);

type LiteralParameters = {
  meta?: Record<string, any>;
  value: string | number | boolean;
};

export class Literal extends Expression {
  declare value: string | number | boolean;
  constructor(value: LiteralParameters) {
    super('Literal', value);
  }
}

Schema.register('Literal', Literal);

type IdentifierParameters = {
  meta?: Record<string, any>;
  name: string;
  external?: boolean;
};

export class Identifier extends Expression {
  declare name: string;
  declare external: boolean;
  constructor(value: IdentifierParameters) {
    super('Identifier', value);
  }
}

Schema.register('Identifier', Identifier);

type ValParameters = {
  meta?: Record<string, any>;
  name: string;
  init: Expression;
  kind?: Kind | null;
};

export class Val extends Variable {
  declare init: Expression;
  declare kind: Kind | null;
  constructor(value: ValParameters) {
    super('Val', value);
  }
}

Schema.register('Val', Val);

type ArrayExpressionParameters = {
  meta?: Record<string, any>;
  elements: Expression[];
};

export class ArrayExpression extends Expression {
  declare elements: Expression[];
  constructor(value: ArrayExpressionParameters) {
    super('ArrayExpression', value);
  }
}

Schema.register('ArrayExpression', ArrayExpression);

type BinaryExpressionParameters = {
  meta?: Record<string, any>;
  left: Expression;
  operator:
    | '+'
    | '-'
    | '*'
    | '/'
    | '!='
    | '=='
    | '<'
    | '<='
    | '>'
    | '>='
    | '||'
    | '&&'
    | '??'
    | '^'
    | '%';
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
    | '>='
    | '||'
    | '&&'
    | '??'
    | '^'
    | '%';
  declare right: Expression;
  constructor(value: BinaryExpressionParameters) {
    super('BinaryExpression', value);
  }
}

Schema.register('BinaryExpression', BinaryExpression);

type ObjectExpressionParameters = {
  meta?: Record<string, any>;
  properties: Record<string, Expression>;
};

export class ObjectExpression extends Expression {
  declare properties: Record<string, Expression>;
  constructor(value: ObjectExpressionParameters) {
    super('ObjectExpression', value);
  }
}

Schema.register('ObjectExpression', ObjectExpression);

type BlockParameters = {
  meta?: Record<string, any>;
  statements: Expression[];
};

export class Block extends Expression {
  declare statements: Expression[];
  constructor(value: BlockParameters) {
    super('Block', value);
  }
}

Schema.register('Block', Block);

type FuncParameters = {
  meta?: Record<string, any>;
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

type CallExpressionParameters = {
  meta?: Record<string, any>;
  identifier: Identifier;
  params?: Record<string, Expression>;
};

export class CallExpression extends Expression {
  declare identifier: Identifier;
  declare params: Record<string, Expression>;
  constructor(value: CallExpressionParameters) {
    super('CallExpression', value);
  }
}

Schema.register('CallExpression', CallExpression);

type ConditionalExpressionParameters = {
  meta?: Record<string, any>;
  condition: Expression;
  consequent: Expression;
  alternate: Expression;
};

export class ConditionalExpression extends Expression {
  declare condition: Expression;
  declare consequent: Expression;
  declare alternate: Expression;
  constructor(value: ConditionalExpressionParameters) {
    super('ConditionalExpression', value);
  }
}

Schema.register('ConditionalExpression', ConditionalExpression);

type IfStatementParameters = {
  meta?: Record<string, any>;
  condition: Expression;
  consequent: Block;
};

export class IfStatement extends Expression {
  declare condition: Expression;
  declare consequent: Block;
  constructor(value: IfStatementParameters) {
    super('IfStatement', value);
  }
}

Schema.register('IfStatement', IfStatement);

type AssignmentParameters = {
  meta?: Record<string, any>;
  left: Identifier | MemberExpression;
  operator: '=' | '+=' | '-=' | '*=' | '/=' | '^=' | '%=';
  right: Expression;
};

export class Assignment extends Expression {
  declare left: Identifier | MemberExpression;
  declare operator: '=' | '+=' | '-=' | '*=' | '/=' | '^=' | '%=';
  declare right: Expression;
  constructor(value: AssignmentParameters) {
    super('Assignment', value);
  }
}

Schema.register('Assignment', Assignment);

type MemberExpressionParameters = {
  meta?: Record<string, any>;
  object: Identifier | MemberExpression;
  property: Expression;
};

export class MemberExpression extends Expression {
  declare object: Identifier | MemberExpression;
  declare property: Expression;
  constructor(value: MemberExpressionParameters) {
    super('MemberExpression', value);
  }
}

Schema.register('MemberExpression', MemberExpression);

type ComponentPropParameters = {
  meta?: Record<string, any>;
  name: string;
  init?: Expression | null;
  kind?: Kind | null;
};

export class ComponentProp extends Variable {
  declare init: Expression | null;
  declare kind: Kind | null;
  constructor(value: ComponentPropParameters) {
    super('ComponentProp', value);
  }
}

Schema.register('ComponentProp', ComponentProp);

type ComponentParameters = {
  meta?: Record<string, any>;
  name: string;
};

export abstract class Component extends Variable {
  constructor(type: string, value: ComponentParameters) {
    super(type, value);
  }
}

Schema.register('Component', Component);

type RekaComponentParameters = {
  meta?: Record<string, any>;
  name: string;
  template: Template;
  state: Val[];
  props: ComponentProp[];
};

export class RekaComponent extends Component {
  declare template: Template;
  declare state: Val[];
  declare props: ComponentProp[];
  constructor(value: RekaComponentParameters) {
    super('RekaComponent', value);
  }
}

Schema.register('RekaComponent', RekaComponent);

type ExternalComponentParameters = {
  meta?: Record<string, any>;
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

type TemplateParameters = {
  meta?: Record<string, any>;
  props?: Record<string, Expression>;
  if?: Expression | null;
  each?: ElementEach | null;
  classList?: ObjectExpression | null;
};

export abstract class Template extends Expression {
  declare props: Record<string, Expression>;
  declare if: Expression | null;
  declare each: ElementEach | null;
  declare classList: ObjectExpression | null;
  constructor(type: string, value: TemplateParameters) {
    super(type, value);
  }
}

Schema.register('Template', Template);

type SlottableTemplateParameters = {
  meta?: Record<string, any>;
  props?: Record<string, Expression>;
  if?: Expression | null;
  each?: ElementEach | null;
  classList?: ObjectExpression | null;
  children?: Template[];
};

export abstract class SlottableTemplate extends Template {
  declare children: Template[];
  constructor(type: string, value: SlottableTemplateParameters) {
    super(type, value);
  }
}

Schema.register('SlottableTemplate', SlottableTemplate);

type TagTemplateParameters = {
  meta?: Record<string, any>;
  props?: Record<string, Expression>;
  if?: Expression | null;
  each?: ElementEach | null;
  classList?: ObjectExpression | null;
  children?: Template[];
  tag: string;
};

export class TagTemplate extends SlottableTemplate {
  declare tag: string;
  constructor(value: TagTemplateParameters) {
    super('TagTemplate', value);
  }
}

Schema.register('TagTemplate', TagTemplate);

type ComponentTemplateParameters = {
  meta?: Record<string, any>;
  props?: Record<string, Expression>;
  if?: Expression | null;
  each?: ElementEach | null;
  classList?: ObjectExpression | null;
  children?: Template[];
  component: Identifier;
};

export class ComponentTemplate extends SlottableTemplate {
  declare component: Identifier;
  constructor(value: ComponentTemplateParameters) {
    super('ComponentTemplate', value);
  }
}

Schema.register('ComponentTemplate', ComponentTemplate);

type SlotTemplateParameters = {
  meta?: Record<string, any>;
  props?: Record<string, Expression>;
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

type ElementEachAliasParameters = {
  meta?: Record<string, any>;
  name: string;
};

export class ElementEachAlias extends Variable {
  constructor(value: ElementEachAliasParameters) {
    super('ElementEachAlias', value);
  }
}

Schema.register('ElementEachAlias', ElementEachAlias);

type ElementEachIndexParameters = {
  meta?: Record<string, any>;
  name: string;
};

export class ElementEachIndex extends Variable {
  constructor(value: ElementEachIndexParameters) {
    super('ElementEachIndex', value);
  }
}

Schema.register('ElementEachIndex', ElementEachIndex);

type ElementEachParameters = {
  meta?: Record<string, any>;
  alias: ElementEachAlias;
  index?: ElementEachIndex | null;
  iterator: Expression;
};

export class ElementEach extends ASTNode {
  declare alias: ElementEachAlias;
  declare index: ElementEachIndex | null;
  declare iterator: Expression;
  constructor(value: ElementEachParameters) {
    super('ElementEach', value);
  }
}

Schema.register('ElementEach', ElementEach);

type ViewParameters = {
  key: string;
  template: Template;
  frame: string;
  owner?: ComponentView | null;
};

export abstract class View extends Type {
  declare key: string;
  declare template: Template;
  declare frame: string;
  declare owner: ComponentView | null;
  constructor(type: string, value: ViewParameters) {
    super(type, value);
  }
}

Schema.register('View', View);

type SlottableViewParameters = {
  key: string;
  template: Template;
  frame: string;
  owner?: ComponentView | null;
  children?: View[];
};

export abstract class SlottableView extends View {
  declare children: View[];
  constructor(type: string, value: SlottableViewParameters) {
    super(type, value);
  }
}

Schema.register('SlottableView', SlottableView);

type TagViewParameters = {
  key: string;
  template: Template;
  frame: string;
  owner?: ComponentView | null;
  children?: View[];
  tag: string;
  props: Record<string, any>;
};

export class TagView extends SlottableView {
  declare tag: string;
  declare props: Record<string, any>;
  constructor(value: TagViewParameters) {
    super('TagView', value);
  }
}

Schema.register('TagView', TagView);

type ComponentViewParameters = {
  key: string;
  template: Template;
  frame: string;
  owner?: ComponentView | null;
  children?: View[];
  component: Component;
};

export abstract class ComponentView extends SlottableView {
  declare component: Component;
  constructor(type: string, value: ComponentViewParameters) {
    super(type, value);
  }
}

Schema.register('ComponentView', ComponentView);

type RekaComponentViewParameters = {
  key: string;
  template: Template;
  frame: string;
  owner?: ComponentView | null;
  children?: View[];
  component: RekaComponent;
  render: View[];
};

export class RekaComponentView extends ComponentView {
  declare component: RekaComponent;
  declare render: View[];
  constructor(value: RekaComponentViewParameters) {
    super('RekaComponentView', value);
  }
}

Schema.register('RekaComponentView', RekaComponentView);

type ExternalComponentViewParameters = {
  key: string;
  template: Template;
  frame: string;
  owner?: ComponentView | null;
  children?: View[];
  component: ExternalComponent;
  props: Record<string, any>;
};

export class ExternalComponentView extends ComponentView {
  declare component: ExternalComponent;
  declare props: Record<string, any>;
  constructor(value: ExternalComponentViewParameters) {
    super('ExternalComponentView', value);
  }
}

Schema.register('ExternalComponentView', ExternalComponentView);

type SlotViewParameters = {
  key: string;
  template: Template;
  frame: string;
  owner?: ComponentView | null;
  children: View[];
};

export class SlotView extends View {
  declare children: View[];
  constructor(value: SlotViewParameters) {
    super('SlotView', value);
  }
}

Schema.register('SlotView', SlotView);

type SystemViewParameters = {
  key: string;
  template: Template;
  frame: string;
  owner?: ComponentView | null;
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
  frame: string;
  owner?: ComponentView | null;
  children: View[];
};

export class EachSystemView extends SystemView {
  declare children: View[];
  constructor(value: EachSystemViewParameters) {
    super('EachSystemView', value);
  }
}

Schema.register('EachSystemView', EachSystemView);

type ErrorSystemViewParameters = {
  key: string;
  template: Template;
  frame: string;
  owner?: ComponentView | null;
  error: string;
};

export class ErrorSystemView extends SystemView {
  declare error: string;
  constructor(value: ErrorSystemViewParameters) {
    super('ErrorSystemView', value);
  }
}

Schema.register('ErrorSystemView', ErrorSystemView);

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

type ExternalStateParameters = {
  meta?: Record<string, any>;
  name: string;
  init: any;
};

export class ExternalState extends Variable {
  declare init: any;
  constructor(value: ExternalStateParameters) {
    super('ExternalState', value);
  }
}

Schema.register('ExternalState', ExternalState);

type ExternalFuncParameters = {
  meta?: Record<string, any>;
  name: string;
  func: Function;
};

export class ExternalFunc extends Variable {
  declare func: Function;
  constructor(value: ExternalFuncParameters) {
    super('ExternalFunc', value);
  }
}

Schema.register('ExternalFunc', ExternalFunc);

export type Statement = Assignment;
export type Any =
  | State
  | ASTNode
  | Program
  | Kind
  | PrimitiveKind
  | ArrayKind
  | OptionKind
  | Expression
  | Variable
  | Literal
  | Identifier
  | Val
  | ArrayExpression
  | BinaryExpression
  | ObjectExpression
  | Block
  | Func
  | CallExpression
  | ConditionalExpression
  | IfStatement
  | Assignment
  | MemberExpression
  | ComponentProp
  | Component
  | RekaComponent
  | ExternalComponent
  | Template
  | SlottableTemplate
  | TagTemplate
  | ComponentTemplate
  | SlotTemplate
  | ElementEachAlias
  | ElementEachIndex
  | ElementEach
  | View
  | SlottableView
  | TagView
  | ComponentView
  | RekaComponentView
  | ExternalComponentView
  | SlotView
  | SystemView
  | EachSystemView
  | ErrorSystemView
  | ExtensionState
  | ExternalState
  | ExternalFunc;
export type Visitor = {
  State: (node: State) => any;
  ASTNode: (node: ASTNode) => any;
  Program: (node: Program) => any;
  Kind: (node: Kind) => any;
  PrimitiveKind: (node: PrimitiveKind) => any;
  ArrayKind: (node: ArrayKind) => any;
  OptionKind: (node: OptionKind) => any;
  Expression: (node: Expression) => any;
  Variable: (node: Variable) => any;
  Literal: (node: Literal) => any;
  Identifier: (node: Identifier) => any;
  Val: (node: Val) => any;
  ArrayExpression: (node: ArrayExpression) => any;
  BinaryExpression: (node: BinaryExpression) => any;
  ObjectExpression: (node: ObjectExpression) => any;
  Block: (node: Block) => any;
  Func: (node: Func) => any;
  CallExpression: (node: CallExpression) => any;
  ConditionalExpression: (node: ConditionalExpression) => any;
  IfStatement: (node: IfStatement) => any;
  Assignment: (node: Assignment) => any;
  MemberExpression: (node: MemberExpression) => any;
  ComponentProp: (node: ComponentProp) => any;
  Component: (node: Component) => any;
  RekaComponent: (node: RekaComponent) => any;
  ExternalComponent: (node: ExternalComponent) => any;
  Template: (node: Template) => any;
  SlottableTemplate: (node: SlottableTemplate) => any;
  TagTemplate: (node: TagTemplate) => any;
  ComponentTemplate: (node: ComponentTemplate) => any;
  SlotTemplate: (node: SlotTemplate) => any;
  ElementEachAlias: (node: ElementEachAlias) => any;
  ElementEachIndex: (node: ElementEachIndex) => any;
  ElementEach: (node: ElementEach) => any;
  View: (node: View) => any;
  SlottableView: (node: SlottableView) => any;
  TagView: (node: TagView) => any;
  ComponentView: (node: ComponentView) => any;
  RekaComponentView: (node: RekaComponentView) => any;
  ExternalComponentView: (node: ExternalComponentView) => any;
  SlotView: (node: SlotView) => any;
  SystemView: (node: SystemView) => any;
  EachSystemView: (node: EachSystemView) => any;
  ErrorSystemView: (node: ErrorSystemView) => any;
  ExtensionState: (node: ExtensionState) => any;
  ExternalState: (node: ExternalState) => any;
  ExternalFunc: (node: ExternalFunc) => any;
};
