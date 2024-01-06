import { Type } from '../node';
import { Schema } from '../schema';

type StateParameters = {
  program: Program;
  extensions?: Record<string, ExtensionState>;
};

export class State extends Type {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isState?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isASTNode?: string;

  declare meta: Record<string, any>;
  constructor(type: string, value?: ASTNodeParameters) {
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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isProgram?: string;

  declare globals: Val[];
  declare components: RekaComponent[];
  constructor(value?: ProgramParameters) {
    super('Program', value);
  }
}

Schema.register('Program', Program);

export abstract class Kind extends Type {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isKind?: string;

  constructor(type: string, value?: any) {
    super(type, value);
  }
}

Schema.register('Kind', Kind);

export class AnyKind extends Kind {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isAnyKind?: string;

  constructor() {
    super('AnyKind');
  }
}

Schema.register('AnyKind', AnyKind);

export class StringKind extends Kind {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isStringKind?: string;

  constructor() {
    super('StringKind');
  }
}

Schema.register('StringKind', StringKind);

type NumberKindParameters = {
  min?: number | null;
  max?: number | null;
};

export class NumberKind extends Kind {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isNumberKind?: string;

  declare min: number | null;
  declare max: number | null;
  constructor(value?: NumberKindParameters) {
    super('NumberKind', value);
  }
}

Schema.register('NumberKind', NumberKind);

export class BooleanKind extends Kind {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isBooleanKind?: string;

  constructor() {
    super('BooleanKind');
  }
}

Schema.register('BooleanKind', BooleanKind);

type ArrayKindParameters = {
  elements: Kind;
};

export class ArrayKind extends Kind {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isArrayKind?: string;

  declare elements: Kind;
  constructor(value: ArrayKindParameters) {
    super('ArrayKind', value);
  }
}

Schema.register('ArrayKind', ArrayKind);

type OptionKindParameters = {
  options: Record<string, string>;
};

export class OptionKind extends Kind {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isOptionKind?: string;

  declare options: Record<string, string>;
  constructor(value: OptionKindParameters) {
    super('OptionKind', value);
  }
}

Schema.register('OptionKind', OptionKind);

type CustomKindParameters = {
  name: string;
};

export class CustomKind extends Kind {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isCustomKind?: string;

  declare name: string;
  constructor(value: CustomKindParameters) {
    super('CustomKind', value);
  }
}

Schema.register('CustomKind', CustomKind);

type ExpressionParameters = {
  meta?: Record<string, any>;
};

export abstract class Expression extends ASTNode {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isExpression?: string;

  constructor(type: string, value?: ExpressionParameters) {
    super(type, value);
  }
}

Schema.register('Expression', Expression);

type IdentifiableParameters = {
  meta?: Record<string, any>;
  name: string;
};

export abstract class Identifiable extends Expression {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isIdentifiable?: string;

  declare name: string;
  constructor(type: string, value: IdentifiableParameters) {
    super(type, value);
  }
}

Schema.register('Identifiable', Identifiable);

type VariableParameters = {
  meta?: Record<string, any>;
  name: string;
  kind?: Kind;
  init?: Expression | null;
};

export abstract class Variable extends Identifiable {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isVariable?: string;

  declare kind: Kind;
  declare init: Expression | null;
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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isLiteral?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isIdentifier?: string;

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
  kind?: Kind;
  init?: Expression | null;
};

export class Val extends Variable {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isVal?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isArrayExpression?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isBinaryExpression?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isObjectExpression?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isBlock?: string;

  declare statements: Expression[];
  constructor(value: BlockParameters) {
    super('Block', value);
  }
}

Schema.register('Block', Block);

type ParamParameters = {
  meta?: Record<string, any>;
  name: string;
};

export class Param extends Identifiable {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isParam?: string;

  constructor(value: ParamParameters) {
    super('Param', value);
  }
}

Schema.register('Param', Param);

type FuncParameters = {
  meta?: Record<string, any>;
  name?: string | null;
  params: Param[];
  body: Block;
};

export class Func extends Expression {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isFunc?: string;

  declare name: string | null;
  declare params: Param[];
  declare body: Block;
  constructor(value: FuncParameters) {
    super('Func', value);
  }
}

Schema.register('Func', Func);

type CallExpressionParameters = {
  meta?: Record<string, any>;
  identifier: Identifier;
  arguments?: Expression[];
};

export class CallExpression extends Expression {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isCallExpression?: string;

  declare identifier: Identifier;
  declare arguments: Expression[];
  constructor(value: CallExpressionParameters) {
    super('CallExpression', value);
  }
}

Schema.register('CallExpression', CallExpression);

type UnaryExpressionParameters = {
  meta?: Record<string, any>;
  operator: '-' | '+';
  argument: Expression;
};

export class UnaryExpression extends Expression {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isUnaryExpression?: string;

  declare operator: '-' | '+';
  declare argument: Expression;
  constructor(value: UnaryExpressionParameters) {
    super('UnaryExpression', value);
  }
}

Schema.register('UnaryExpression', UnaryExpression);

type ConditionalExpressionParameters = {
  meta?: Record<string, any>;
  condition: Expression;
  consequent: Expression;
  alternate: Expression;
};

export class ConditionalExpression extends Expression {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isConditionalExpression?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isIfStatement?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isAssignment?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isMemberExpression?: string;

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
  kind?: Kind;
  init?: Expression | null;
  bindable?: boolean;
};

export class ComponentProp extends Variable {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isComponentProp?: string;

  declare bindable: boolean;
  constructor(value: ComponentPropParameters) {
    super('ComponentProp', value);
  }
}

Schema.register('ComponentProp', ComponentProp);

type ComponentParameters = {
  meta?: Record<string, any>;
  name: string;
};

export abstract class Component extends Identifiable {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isComponent?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isRekaComponent?: string;

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
  props?: ComponentProp[];
};

export class ExternalComponent extends Component {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isExternalComponent?: string;

  declare render: Function;
  declare props: ComponentProp[];
  constructor(value: ExternalComponentParameters) {
    super('ExternalComponent', value);
  }
}

Schema.register('ExternalComponent', ExternalComponent);

type PropBindingParameters = {
  meta?: Record<string, any>;
  identifier: Identifier;
};

export class PropBinding extends Expression {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isPropBinding?: string;

  declare identifier: Identifier;
  constructor(value: PropBindingParameters) {
    super('PropBinding', value);
  }
}

Schema.register('PropBinding', PropBinding);

type TemplateParameters = {
  meta?: Record<string, any>;
  props?: Record<string, Expression>;
  if?: Expression | null;
  each?: ElementEach | null;
  classList?: ObjectExpression | null;
};

export abstract class Template extends Expression {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isTemplate?: string;

  declare props: Record<string, Expression>;
  declare if: Expression | null;
  declare each: ElementEach | null;
  declare classList: ObjectExpression | null;
  constructor(type: string, value?: TemplateParameters) {
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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isSlottableTemplate?: string;

  declare children: Template[];
  constructor(type: string, value?: SlottableTemplateParameters) {
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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isTagTemplate?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isComponentTemplate?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isSlotTemplate?: string;

  constructor(value?: SlotTemplateParameters) {
    super('SlotTemplate', value);
  }
}

Schema.register('SlotTemplate', SlotTemplate);

type ElementEachAliasParameters = {
  meta?: Record<string, any>;
  name: string;
};

export class ElementEachAlias extends Identifiable {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isElementEachAlias?: string;

  constructor(value: ElementEachAliasParameters) {
    super('ElementEachAlias', value);
  }
}

Schema.register('ElementEachAlias', ElementEachAlias);

type ElementEachIndexParameters = {
  meta?: Record<string, any>;
  name: string;
};

export class ElementEachIndex extends Identifiable {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isElementEachIndex?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isElementEach?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isView?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isSlottableView?: string;

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
  bindings: Record<string, Function>;
};

export class TagView extends SlottableView {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isTagView?: string;

  declare tag: string;
  declare props: Record<string, any>;
  declare bindings: Record<string, Function>;
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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isComponentView?: string;

  declare component: Component;
  constructor(type: string, value: ComponentViewParameters) {
    super(type, value);
  }
}

Schema.register('ComponentView', ComponentView);

type FragmentViewParameters = {
  key: string;
  template: Template;
  frame: string;
  owner?: ComponentView | null;
  children?: View[];
};

export class FragmentView extends SlottableView {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isFragmentView?: string;

  constructor(value: FragmentViewParameters) {
    super('FragmentView', value);
  }
}

Schema.register('FragmentView', FragmentView);

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isRekaComponentView?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isExternalComponentView?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isSlotView?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isSystemView?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isEachSystemView?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isErrorSystemView?: string;

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
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isExtensionState?: string;

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

export class ExternalState extends Identifiable {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isExternalState?: string;

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

export class ExternalFunc extends Identifiable {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isExternalFunc?: string;

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
  | AnyKind
  | StringKind
  | NumberKind
  | BooleanKind
  | ArrayKind
  | OptionKind
  | CustomKind
  | Expression
  | Identifiable
  | Variable
  | Literal
  | Identifier
  | Val
  | ArrayExpression
  | BinaryExpression
  | ObjectExpression
  | Block
  | Param
  | Func
  | CallExpression
  | UnaryExpression
  | ConditionalExpression
  | IfStatement
  | Assignment
  | MemberExpression
  | ComponentProp
  | Component
  | RekaComponent
  | ExternalComponent
  | PropBinding
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
  | FragmentView
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
  AnyKind: (node: AnyKind) => any;
  StringKind: (node: StringKind) => any;
  NumberKind: (node: NumberKind) => any;
  BooleanKind: (node: BooleanKind) => any;
  ArrayKind: (node: ArrayKind) => any;
  OptionKind: (node: OptionKind) => any;
  CustomKind: (node: CustomKind) => any;
  Expression: (node: Expression) => any;
  Identifiable: (node: Identifiable) => any;
  Variable: (node: Variable) => any;
  Literal: (node: Literal) => any;
  Identifier: (node: Identifier) => any;
  Val: (node: Val) => any;
  ArrayExpression: (node: ArrayExpression) => any;
  BinaryExpression: (node: BinaryExpression) => any;
  ObjectExpression: (node: ObjectExpression) => any;
  Block: (node: Block) => any;
  Param: (node: Param) => any;
  Func: (node: Func) => any;
  CallExpression: (node: CallExpression) => any;
  UnaryExpression: (node: UnaryExpression) => any;
  ConditionalExpression: (node: ConditionalExpression) => any;
  IfStatement: (node: IfStatement) => any;
  Assignment: (node: Assignment) => any;
  MemberExpression: (node: MemberExpression) => any;
  ComponentProp: (node: ComponentProp) => any;
  Component: (node: Component) => any;
  RekaComponent: (node: RekaComponent) => any;
  ExternalComponent: (node: ExternalComponent) => any;
  PropBinding: (node: PropBinding) => any;
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
  FragmentView: (node: FragmentView) => any;
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
