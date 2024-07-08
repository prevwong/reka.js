import { Type, TypeConstructorOptions } from '../node';
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
  constructor(value: StateParameters, opts?: Partial<TypeConstructorOptions>) {
    super('State', value, opts);
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
  constructor(
    type: string,
    value?: ASTNodeParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super(type, value, opts);
  }
}

Schema.register('ASTNode', ASTNode);

type ProgramParameters = {
  meta?: Record<string, any>;
  globals?: Array<Val>;
  components?: Array<RekaComponent>;
};

export class Program extends ASTNode {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isProgram?: string;

  declare globals: Array<Val>;
  declare components: Array<RekaComponent>;
  constructor(
    value?: ProgramParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('Program', value, opts);
  }
}

Schema.register('Program', Program);

export abstract class Kind extends Type {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isKind?: string;

  constructor(
    type: string,
    value?: any,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super(type, value, opts);
  }
}

Schema.register('Kind', Kind);

export class AnyKind extends Kind {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isAnyKind?: string;

  constructor(opts?: Partial<TypeConstructorOptions>) {
    super('AnyKind', opts);
  }
}

Schema.register('AnyKind', AnyKind);

export class StringKind extends Kind {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isStringKind?: string;

  constructor(opts?: Partial<TypeConstructorOptions>) {
    super('StringKind', opts);
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
  constructor(
    value?: NumberKindParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('NumberKind', value, opts);
  }
}

Schema.register('NumberKind', NumberKind);

export class BooleanKind extends Kind {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isBooleanKind?: string;

  constructor(opts?: Partial<TypeConstructorOptions>) {
    super('BooleanKind', opts);
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
  constructor(
    value: ArrayKindParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('ArrayKind', value, opts);
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
  constructor(
    value: OptionKindParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('OptionKind', value, opts);
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
  constructor(
    value: CustomKindParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('CustomKind', value, opts);
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

  constructor(
    type: string,
    value?: ExpressionParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super(type, value, opts);
  }
}

Schema.register('Expression', Expression);

type IdentifiableParameters = {
  meta?: Record<string, any>;
  name: string;
};

export abstract class Identifiable extends ASTNode {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isIdentifiable?: string;

  declare name: string;
  constructor(
    type: string,
    value: IdentifiableParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super(type, value, opts);
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
  constructor(
    type: string,
    value: VariableParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super(type, value, opts);
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
  constructor(
    value: LiteralParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('Literal', value, opts);
  }
}

Schema.register('Literal', Literal);

type StringParameters = {
  meta?: Record<string, any>;
  value: Array<string | Expression>;
};

export class String extends Expression {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isString?: string;

  declare value: Array<string | Expression>;
  constructor(value: StringParameters, opts?: Partial<TypeConstructorOptions>) {
    super('String', value, opts);
  }
}

Schema.register('String', String);

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
  constructor(
    value: IdentifierParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('Identifier', value, opts);
  }

  get identifiable(): Identifiable | null {
    return Schema.computeAnnotatedProp(this, 'identifiable');
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

  constructor(value: ValParameters, opts?: Partial<TypeConstructorOptions>) {
    super('Val', value, opts);
  }
}

Schema.register('Val', Val);

type ArrayExpressionParameters = {
  meta?: Record<string, any>;
  elements: Array<Expression>;
};

export class ArrayExpression extends Expression {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isArrayExpression?: string;

  declare elements: Array<Expression>;
  constructor(
    value: ArrayExpressionParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('ArrayExpression', value, opts);
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
  constructor(
    value: BinaryExpressionParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('BinaryExpression', value, opts);
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
  constructor(
    value: ObjectExpressionParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('ObjectExpression', value, opts);
  }
}

Schema.register('ObjectExpression', ObjectExpression);

type BlockParameters = {
  meta?: Record<string, any>;
  statements: Array<Expression>;
};

export class Block extends Expression {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isBlock?: string;

  declare statements: Array<Expression>;
  constructor(value: BlockParameters, opts?: Partial<TypeConstructorOptions>) {
    super('Block', value, opts);
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

  constructor(value: ParamParameters, opts?: Partial<TypeConstructorOptions>) {
    super('Param', value, opts);
  }
}

Schema.register('Param', Param);

type FuncParameters = {
  meta?: Record<string, any>;
  name?: string | null;
  params: Array<Param>;
  body: Block;
};

export class Func extends Expression {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isFunc?: string;

  declare name: string | null;
  declare params: Array<Param>;
  declare body: Block;
  constructor(value: FuncParameters, opts?: Partial<TypeConstructorOptions>) {
    super('Func', value, opts);
  }
}

Schema.register('Func', Func);

type CallExpressionParameters = {
  meta?: Record<string, any>;
  identifier: Identifier;
  arguments?: Array<Expression>;
};

export class CallExpression extends Expression {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isCallExpression?: string;

  declare identifier: Identifier;
  declare arguments: Array<Expression>;
  constructor(
    value: CallExpressionParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('CallExpression', value, opts);
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
  constructor(
    value: UnaryExpressionParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('UnaryExpression', value, opts);
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
  constructor(
    value: ConditionalExpressionParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('ConditionalExpression', value, opts);
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
  constructor(
    value: IfStatementParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('IfStatement', value, opts);
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
  constructor(
    value: AssignmentParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('Assignment', value, opts);
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
  constructor(
    value: MemberExpressionParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('MemberExpression', value, opts);
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
  constructor(
    value: ComponentPropParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('ComponentProp', value, opts);
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

  constructor(
    type: string,
    value: ComponentParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super(type, value, opts);
  }
}

Schema.register('Component', Component);

type RekaComponentParameters = {
  meta?: Record<string, any>;
  name: string;
  template?: null | Template;
  state: Array<Val>;
  props: Array<ComponentProp>;
};

export class RekaComponent extends Component {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isRekaComponent?: string;

  declare template: null | Template;
  declare state: Array<Val>;
  declare props: Array<ComponentProp>;
  constructor(
    value: RekaComponentParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('RekaComponent', value, opts);
  }
}

Schema.register('RekaComponent', RekaComponent);

type ExternalComponentParameters = {
  meta?: Record<string, any>;
  name: string;
  render: any;
  props?: Array<ComponentProp>;
};

export class ExternalComponent extends Component {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isExternalComponent?: string;

  declare render: any;
  declare props: Array<ComponentProp>;
  constructor(
    value: ExternalComponentParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('ExternalComponent', value, opts);
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
  constructor(
    value: PropBindingParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('PropBinding', value, opts);
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

export abstract class Template extends ASTNode {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isTemplate?: string;

  declare props: Record<string, Expression>;
  declare if: Expression | null;
  declare each: ElementEach | null;
  declare classList: ObjectExpression | null;
  constructor(
    type: string,
    value?: TemplateParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super(type, value, opts);
  }
}

Schema.register('Template', Template);

type SlottableTemplateParameters = {
  meta?: Record<string, any>;
  props?: Record<string, Expression>;
  if?: Expression | null;
  each?: ElementEach | null;
  classList?: ObjectExpression | null;
  children?: Array<Template>;
  slots?: Record<string, Array<Template>>;
};

export abstract class SlottableTemplate extends Template {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isSlottableTemplate?: string;

  declare children: Array<Template>;
  declare slots: Record<string, Array<Template>>;
  constructor(
    type: string,
    value?: SlottableTemplateParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super(type, value, opts);
  }
}

Schema.register('SlottableTemplate', SlottableTemplate);

type FragmentTemplateParameters = {
  meta?: Record<string, any>;
  props?: Record<string, Expression>;
  if?: Expression | null;
  each?: ElementEach | null;
  classList?: ObjectExpression | null;
  children?: Array<Template>;
  slots?: Record<string, Array<Template>>;
};

export abstract class FragmentTemplate extends SlottableTemplate {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isFragmentTemplate?: string;

  constructor(
    type: string,
    value?: FragmentTemplateParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super(type, value, opts);
  }
}

Schema.register('FragmentTemplate', FragmentTemplate);

type RootTemplateParameters = {
  meta?: Record<string, any>;
  props?: Record<string, Expression>;
  if?: Expression | null;
  each?: ElementEach | null;
  classList?: ObjectExpression | null;
  children?: Array<Template>;
  slots?: Record<string, Array<Template>>;
};

export class RootTemplate extends FragmentTemplate {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isRootTemplate?: string;

  constructor(
    value?: RootTemplateParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('RootTemplate', value, opts);
  }
}

Schema.register('RootTemplate', RootTemplate);

type TagTemplateParameters = {
  meta?: Record<string, any>;
  props?: Record<string, Expression>;
  if?: Expression | null;
  each?: ElementEach | null;
  classList?: ObjectExpression | null;
  children?: Array<Template>;
  slots?: Record<string, Array<Template>>;
  tag: string;
};

export class TagTemplate extends SlottableTemplate {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isTagTemplate?: string;

  declare tag: string;
  constructor(
    value: TagTemplateParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('TagTemplate', value, opts);
  }
}

Schema.register('TagTemplate', TagTemplate);

type ComponentTemplateParameters = {
  meta?: Record<string, any>;
  props?: Record<string, Expression>;
  if?: Expression | null;
  each?: ElementEach | null;
  classList?: ObjectExpression | null;
  children?: Array<Template>;
  slots?: Record<string, Array<Template>>;
  component: Identifier;
};

export class ComponentTemplate extends SlottableTemplate {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isComponentTemplate?: string;

  declare component: Identifier;
  constructor(
    value: ComponentTemplateParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('ComponentTemplate', value, opts);
  }
}

Schema.register('ComponentTemplate', ComponentTemplate);

type SlotTemplateParameters = {
  meta?: Record<string, any>;
  props?: Record<string, Expression>;
  if?: Expression | null;
  each?: ElementEach | null;
  classList?: ObjectExpression | null;
  name?: string | null;
  accepts?: Identifier | null;
};

export class SlotTemplate extends Template {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isSlotTemplate?: string;

  declare name: string | null;
  declare accepts: Identifier | null;
  constructor(
    value?: SlotTemplateParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('SlotTemplate', value, opts);
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

  constructor(
    value: ElementEachAliasParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('ElementEachAlias', value, opts);
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

  constructor(
    value: ElementEachIndexParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('ElementEachIndex', value, opts);
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
  constructor(
    value: ElementEachParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('ElementEach', value, opts);
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
  constructor(
    type: string,
    value: ViewParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super(type, value, opts);
  }
}

Schema.register('View', View);

type SlottableViewParameters = {
  key: string;
  template: Template;
  frame: string;
  owner?: ComponentView | null;
  children?: Array<View>;
};

export abstract class SlottableView extends View {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isSlottableView?: string;

  declare children: Array<View>;
  constructor(
    type: string,
    value: SlottableViewParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super(type, value, opts);
  }
}

Schema.register('SlottableView', SlottableView);

type TagViewParameters = {
  key: string;
  template: Template;
  frame: string;
  owner?: ComponentView | null;
  children?: Array<View>;
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
  constructor(
    value: TagViewParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('TagView', value, opts);
  }
}

Schema.register('TagView', TagView);

type ComponentViewParameters = {
  key: string;
  template: Template;
  frame: string;
  owner?: ComponentView | null;
  children?: Array<View>;
  component: Component;
};

export abstract class ComponentView extends SlottableView {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isComponentView?: string;

  declare component: Component;
  constructor(
    type: string,
    value: ComponentViewParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super(type, value, opts);
  }
}

Schema.register('ComponentView', ComponentView);

type FragmentViewParameters = {
  key: string;
  template: Template;
  frame: string;
  owner?: ComponentView | null;
  children?: Array<View>;
};

export class FragmentView extends SlottableView {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isFragmentView?: string;

  constructor(
    value: FragmentViewParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('FragmentView', value, opts);
  }
}

Schema.register('FragmentView', FragmentView);

type FrameViewParameters = {
  key: string;
  template: Template;
  frame: string;
  owner?: ComponentView | null;
  children?: Array<View>;
};

export class FrameView extends SlottableView {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isFrameView?: string;

  constructor(
    value: FrameViewParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('FrameView', value, opts);
  }
}

Schema.register('FrameView', FrameView);

type RekaComponentViewParameters = {
  key: string;
  template: Template;
  frame: string;
  owner?: ComponentView | null;
  children?: Array<View>;
  component: RekaComponent;
  render: Array<View>;
};

export class RekaComponentView extends ComponentView {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isRekaComponentView?: string;

  declare component: RekaComponent;
  declare render: Array<View>;
  constructor(
    value: RekaComponentViewParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('RekaComponentView', value, opts);
  }
}

Schema.register('RekaComponentView', RekaComponentView);

type ExternalComponentViewParameters = {
  key: string;
  template: Template;
  frame: string;
  owner?: ComponentView | null;
  children?: Array<View>;
  component: ExternalComponent;
  props: Record<string, any>;
};

export class ExternalComponentView extends ComponentView {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isExternalComponentView?: string;

  declare component: ExternalComponent;
  declare props: Record<string, any>;
  constructor(
    value: ExternalComponentViewParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('ExternalComponentView', value, opts);
  }
}

Schema.register('ExternalComponentView', ExternalComponentView);

type SlotViewParameters = {
  key: string;
  template: Template;
  frame: string;
  owner?: ComponentView | null;
  children: Array<View>;
};

export class SlotView extends View {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isSlotView?: string;

  declare children: Array<View>;
  constructor(
    value: SlotViewParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('SlotView', value, opts);
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

  constructor(
    type: string,
    value: SystemViewParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super(type, value, opts);
  }
}

Schema.register('SystemView', SystemView);

type EachSystemViewParameters = {
  key: string;
  template: Template;
  frame: string;
  owner?: ComponentView | null;
  children: Array<View>;
};

export class EachSystemView extends SystemView {
  // Type Hack: in order to accurately use type predicates via the .is() util method
  // @ts-ignore
  private declare __isEachSystemView?: string;

  declare children: Array<View>;
  constructor(
    value: EachSystemViewParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('EachSystemView', value, opts);
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
  constructor(
    value: ErrorSystemViewParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('ErrorSystemView', value, opts);
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
  constructor(
    value: ExtensionStateParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('ExtensionState', value, opts);
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
  constructor(
    value: ExternalStateParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('ExternalState', value, opts);
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
  constructor(
    value: ExternalFuncParameters,
    opts?: Partial<TypeConstructorOptions>
  ) {
    super('ExternalFunc', value, opts);
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
  | String
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
  | FragmentTemplate
  | RootTemplate
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
  | FrameView
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
  String: (node: String) => any;
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
  FragmentTemplate: (node: FragmentTemplate) => any;
  RootTemplate: (node: RootTemplate) => any;
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
  FrameView: (node: FrameView) => any;
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
