import * as t from './types.generated';
export const state = (...args: ConstructorParameters<typeof t.State>) =>
  new t.State(...args);
export const program = (...args: ConstructorParameters<typeof t.Program>) =>
  new t.Program(...args);
export const anyKind = (...args: ConstructorParameters<typeof t.AnyKind>) =>
  new t.AnyKind(...args);
export const stringKind = (
  ...args: ConstructorParameters<typeof t.StringKind>
) => new t.StringKind(...args);
export const numberKind = (
  ...args: ConstructorParameters<typeof t.NumberKind>
) => new t.NumberKind(...args);
export const booleanKind = (
  ...args: ConstructorParameters<typeof t.BooleanKind>
) => new t.BooleanKind(...args);
export const arrayKind = (...args: ConstructorParameters<typeof t.ArrayKind>) =>
  new t.ArrayKind(...args);
export const optionKind = (
  ...args: ConstructorParameters<typeof t.OptionKind>
) => new t.OptionKind(...args);
export const customKind = (
  ...args: ConstructorParameters<typeof t.CustomKind>
) => new t.CustomKind(...args);
export const literal = (...args: ConstructorParameters<typeof t.Literal>) =>
  new t.Literal(...args);
export const string = (...args: ConstructorParameters<typeof t.String>) =>
  new t.String(...args);
export const identifier = (
  ...args: ConstructorParameters<typeof t.Identifier>
) => new t.Identifier(...args);
export const val = (...args: ConstructorParameters<typeof t.Val>) =>
  new t.Val(...args);
export const arrayExpression = (
  ...args: ConstructorParameters<typeof t.ArrayExpression>
) => new t.ArrayExpression(...args);
export const binaryExpression = (
  ...args: ConstructorParameters<typeof t.BinaryExpression>
) => new t.BinaryExpression(...args);
export const objectExpression = (
  ...args: ConstructorParameters<typeof t.ObjectExpression>
) => new t.ObjectExpression(...args);
export const block = (...args: ConstructorParameters<typeof t.Block>) =>
  new t.Block(...args);
export const param = (...args: ConstructorParameters<typeof t.Param>) =>
  new t.Param(...args);
export const func = (...args: ConstructorParameters<typeof t.Func>) =>
  new t.Func(...args);
export const callExpression = (
  ...args: ConstructorParameters<typeof t.CallExpression>
) => new t.CallExpression(...args);
export const unaryExpression = (
  ...args: ConstructorParameters<typeof t.UnaryExpression>
) => new t.UnaryExpression(...args);
export const conditionalExpression = (
  ...args: ConstructorParameters<typeof t.ConditionalExpression>
) => new t.ConditionalExpression(...args);
export const ifStatement = (
  ...args: ConstructorParameters<typeof t.IfStatement>
) => new t.IfStatement(...args);
export const assignment = (
  ...args: ConstructorParameters<typeof t.Assignment>
) => new t.Assignment(...args);
export const memberExpression = (
  ...args: ConstructorParameters<typeof t.MemberExpression>
) => new t.MemberExpression(...args);
export const componentProp = (
  ...args: ConstructorParameters<typeof t.ComponentProp>
) => new t.ComponentProp(...args);
export const rekaComponent = (
  ...args: ConstructorParameters<typeof t.RekaComponent>
) => new t.RekaComponent(...args);
export const externalComponent = (
  ...args: ConstructorParameters<typeof t.ExternalComponent>
) => new t.ExternalComponent(...args);
export const propBinding = (
  ...args: ConstructorParameters<typeof t.PropBinding>
) => new t.PropBinding(...args);
export const rootTemplate = (
  ...args: ConstructorParameters<typeof t.RootTemplate>
) => new t.RootTemplate(...args);
export const tagTemplate = (
  ...args: ConstructorParameters<typeof t.TagTemplate>
) => new t.TagTemplate(...args);
export const componentTemplate = (
  ...args: ConstructorParameters<typeof t.ComponentTemplate>
) => new t.ComponentTemplate(...args);
export const slotTemplate = (
  ...args: ConstructorParameters<typeof t.SlotTemplate>
) => new t.SlotTemplate(...args);
export const elementEachAlias = (
  ...args: ConstructorParameters<typeof t.ElementEachAlias>
) => new t.ElementEachAlias(...args);
export const elementEachIndex = (
  ...args: ConstructorParameters<typeof t.ElementEachIndex>
) => new t.ElementEachIndex(...args);
export const elementEach = (
  ...args: ConstructorParameters<typeof t.ElementEach>
) => new t.ElementEach(...args);
export const tagView = (...args: ConstructorParameters<typeof t.TagView>) =>
  new t.TagView(...args);
export const fragmentView = (
  ...args: ConstructorParameters<typeof t.FragmentView>
) => new t.FragmentView(...args);
export const frameView = (...args: ConstructorParameters<typeof t.FrameView>) =>
  new t.FrameView(...args);
export const rekaComponentView = (
  ...args: ConstructorParameters<typeof t.RekaComponentView>
) => new t.RekaComponentView(...args);
export const externalComponentView = (
  ...args: ConstructorParameters<typeof t.ExternalComponentView>
) => new t.ExternalComponentView(...args);
export const slotView = (...args: ConstructorParameters<typeof t.SlotView>) =>
  new t.SlotView(...args);
export const eachSystemView = (
  ...args: ConstructorParameters<typeof t.EachSystemView>
) => new t.EachSystemView(...args);
export const errorSystemView = (
  ...args: ConstructorParameters<typeof t.ErrorSystemView>
) => new t.ErrorSystemView(...args);
export const extensionState = (
  ...args: ConstructorParameters<typeof t.ExtensionState>
) => new t.ExtensionState(...args);
export const externalState = (
  ...args: ConstructorParameters<typeof t.ExternalState>
) => new t.ExternalState(...args);
export const externalFunc = (
  ...args: ConstructorParameters<typeof t.ExternalFunc>
) => new t.ExternalFunc(...args);
