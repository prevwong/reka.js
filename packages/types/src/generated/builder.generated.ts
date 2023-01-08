import * as t from './types.generated';
export const state = (...args: ConstructorParameters<typeof t.State>) =>
  new t.State(...args);
export const program = (...args: ConstructorParameters<typeof t.Program>) =>
  new t.Program(...args);
export const literal = (...args: ConstructorParameters<typeof t.Literal>) =>
  new t.Literal(...args);
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
export const func = (...args: ConstructorParameters<typeof t.Func>) =>
  new t.Func(...args);
export const callExpression = (
  ...args: ConstructorParameters<typeof t.CallExpression>
) => new t.CallExpression(...args);
export const externalGlobal = (
  ...args: ConstructorParameters<typeof t.ExternalGlobal>
) => new t.ExternalGlobal(...args);
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
export const compositeComponent = (
  ...args: ConstructorParameters<typeof t.CompositeComponent>
) => new t.CompositeComponent(...args);
export const externalComponent = (
  ...args: ConstructorParameters<typeof t.ExternalComponent>
) => new t.ExternalComponent(...args);
export const tagTemplate = (
  ...args: ConstructorParameters<typeof t.TagTemplate>
) => new t.TagTemplate(...args);
export const componentTemplate = (
  ...args: ConstructorParameters<typeof t.ComponentTemplate>
) => new t.ComponentTemplate(...args);
export const slotTemplate = (
  ...args: ConstructorParameters<typeof t.SlotTemplate>
) => new t.SlotTemplate(...args);
export const elementEach = (
  ...args: ConstructorParameters<typeof t.ElementEach>
) => new t.ElementEach(...args);
export const tagView = (...args: ConstructorParameters<typeof t.TagView>) =>
  new t.TagView(...args);
export const compositeComponentView = (
  ...args: ConstructorParameters<typeof t.CompositeComponentView>
) => new t.CompositeComponentView(...args);
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
