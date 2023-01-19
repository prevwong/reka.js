import { Schema, Type } from '../schema';

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

type ASTNodeParameters = {};

export abstract class ASTNode extends Type {
  constructor(type: string, value: ASTNodeParameters) {
    super(type, value);
  }
}

Schema.register('ASTNode', ASTNode);

type ProgramParameters = {
  globals: Val[];
  components: RekaComponent[];
};

export class Program extends ASTNode {
  declare globals: Val[];
  declare components: RekaComponent[];
  constructor(value: ProgramParameters) {
    super('Program', value);
  }
}

Schema.register('Program', Program);

type ExpressionParameters = {};

export abstract class Expression extends ASTNode {
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

type BinaryExpressionParameters = {
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
    | '&&';
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
    | '&&';
  declare right: Expression;
  constructor(value: BinaryExpressionParameters) {
    super('BinaryExpression', value);
  }
}

Schema.register('BinaryExpression', BinaryExpression);

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

type BlockParameters = {
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
  identifier: Identifier;
  arguments: Expression[];
};

export class CallExpression extends Expression {
  declare identifier: Identifier;
  declare arguments: Expression[];
  constructor(value: CallExpressionParameters) {
    super('CallExpression', value);
  }
}

Schema.register('CallExpression', CallExpression);

type ExternalGlobalParameters = {
  name: string;
  params: Record<string, Expression>;
};

export class ExternalGlobal extends Expression {
  declare name: string;
  declare params: Record<string, Expression>;
  constructor(value: ExternalGlobalParameters) {
    super('ExternalGlobal', value);
  }
}

Schema.register('ExternalGlobal', ExternalGlobal);

type ConditionalExpressionParameters = {
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
  left: Identifier;
  operator: '=' | '+=' | '-=';
  right: Expression;
};

export class Assignment extends Expression {
  declare left: Identifier;
  declare operator: '=' | '+=' | '-=';
  declare right: Expression;
  constructor(value: AssignmentParameters) {
    super('Assignment', value);
  }
}

Schema.register('Assignment', Assignment);

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

type ComponentPropParameters = {
  name: string;
  init?: Expression | null;
};

export class ComponentProp extends ASTNode {
  declare name: string;
  declare init: Expression | null;
  constructor(value: ComponentPropParameters) {
    super('ComponentProp', value);
  }
}

Schema.register('ComponentProp', ComponentProp);

type ComponentParameters = {
  name: string;
};

export abstract class Component extends ASTNode {
  declare name: string;
  constructor(type: string, value: ComponentParameters) {
    super(type, value);
  }
}

Schema.register('Component', Component);

type RekaComponentParameters = {
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
  props: Record<string, Expression>;
  children: Template[];
  if?: Expression | null;
  each?: ElementEach | null;
  classList?: ObjectExpression | null;
};

export abstract class Template extends ASTNode {
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

type ElementEachParameters = {
  alias: Identifier;
  index?: Identifier | null;
  iterator: Identifier;
};

export class ElementEach extends ASTNode {
  declare alias: Identifier;
  declare index: Identifier | null;
  declare iterator: Identifier;
  constructor(value: ElementEachParameters) {
    super('ElementEach', value);
  }
}

Schema.register('ElementEach', ElementEach);

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

type TagViewParameters = {
  key: string;
  template: Template;
  tag: string;
  children: View[];
  props: Record<string, any>;
};

export class TagView extends View {
  declare tag: string;
  declare children: View[];
  declare props: Record<string, any>;
  constructor(value: TagViewParameters) {
    super('TagView', value);
  }
}

Schema.register('TagView', TagView);

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

type RekaComponentViewParameters = {
  key: string;
  template: Template;
  component: Component;
  render: View[];
};

export class RekaComponentView extends ComponentView {
  declare render: View[];
  constructor(value: RekaComponentViewParameters) {
    super('RekaComponentView', value);
  }
}

Schema.register('RekaComponentView', RekaComponentView);

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

type SlotViewParameters = {
  key: string;
  template: Template;
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

export type Statement = Assignment;
export type Any =
  | State
  | ASTNode
  | Program
  | Expression
  | Literal
  | Identifier
  | Val
  | ArrayExpression
  | BinaryExpression
  | ObjectExpression
  | Block
  | Func
  | CallExpression
  | ExternalGlobal
  | ConditionalExpression
  | IfStatement
  | Assignment
  | MemberExpression
  | ComponentProp
  | Component
  | RekaComponent
  | ExternalComponent
  | Template
  | TagTemplate
  | ComponentTemplate
  | SlotTemplate
  | ElementEach
  | View
  | TagView
  | ComponentView
  | RekaComponentView
  | ExternalComponentView
  | SlotView
  | SystemView
  | EachSystemView
  | ErrorSystemView
  | ExtensionState;
export type Visitor = {
  State: (node: State) => any;
  ASTNode: (node: ASTNode) => any;
  Program: (node: Program) => any;
  Expression: (node: Expression) => any;
  Literal: (node: Literal) => any;
  Identifier: (node: Identifier) => any;
  Val: (node: Val) => any;
  ArrayExpression: (node: ArrayExpression) => any;
  BinaryExpression: (node: BinaryExpression) => any;
  ObjectExpression: (node: ObjectExpression) => any;
  Block: (node: Block) => any;
  Func: (node: Func) => any;
  CallExpression: (node: CallExpression) => any;
  ExternalGlobal: (node: ExternalGlobal) => any;
  ConditionalExpression: (node: ConditionalExpression) => any;
  IfStatement: (node: IfStatement) => any;
  Assignment: (node: Assignment) => any;
  MemberExpression: (node: MemberExpression) => any;
  ComponentProp: (node: ComponentProp) => any;
  Component: (node: Component) => any;
  RekaComponent: (node: RekaComponent) => any;
  ExternalComponent: (node: ExternalComponent) => any;
  Template: (node: Template) => any;
  TagTemplate: (node: TagTemplate) => any;
  ComponentTemplate: (node: ComponentTemplate) => any;
  SlotTemplate: (node: SlotTemplate) => any;
  ElementEach: (node: ElementEach) => any;
  View: (node: View) => any;
  TagView: (node: TagView) => any;
  ComponentView: (node: ComponentView) => any;
  RekaComponentView: (node: RekaComponentView) => any;
  ExternalComponentView: (node: ExternalComponentView) => any;
  SlotView: (node: SlotView) => any;
  SystemView: (node: SystemView) => any;
  EachSystemView: (node: EachSystemView) => any;
  ErrorSystemView: (node: ErrorSystemView) => any;
  ExtensionState: (node: ExtensionState) => any;
};
