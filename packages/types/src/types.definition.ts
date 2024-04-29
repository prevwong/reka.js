import { Schema } from './schema';

Schema.define('State', {
  fields: (t) => ({
    program: t.node('Program'),
    extensions: t.defaultValue(t.map(t.node('ExtensionState')), {}),
  }),
});

Schema.define('ASTNode', {
  abstract: true,
  fields: (t) => ({
    meta: t.defaultValue(t.map(t.any), {}),
  }),
});

Schema.define('Program', {
  extends: 'ASTNode',
  scope: true,
  fields: (t) => ({
    globals: t.defaultValue(t.array(t.node('Val')), []),
    components: t.defaultValue(t.array(t.node('RekaComponent')), []),
  }),
});

Schema.define('Kind', {
  abstract: true,
});

Schema.define('AnyKind', {
  extends: 'Kind',
});

Schema.define('StringKind', {
  extends: 'Kind',
});

Schema.define('NumberKind', {
  extends: 'Kind',
  fields: (t) => ({
    min: t.optional(t.number),
    max: t.optional(t.number),
  }),
});

Schema.define('BooleanKind', {
  extends: 'Kind',
});

Schema.define('ArrayKind', {
  extends: 'Kind',
  fields: (t) => ({
    elements: t.node('Kind'),
  }),
});

Schema.define('OptionKind', {
  extends: 'Kind',
  fields: (t) => ({
    options: t.map(t.string),
  }),
});

Schema.define('CustomKind', {
  extends: 'Kind',
  fields: (t) => ({
    name: t.string,
  }),
});

Schema.define('Expression', {
  extends: 'ASTNode',
  abstract: true,
});

Schema.define('Identifiable', {
  extends: 'ASTNode',
  abstract: true,
  fields: (t) => ({
    name: t.string,
  }),
});

Schema.define('Variable', {
  extends: 'Identifiable',
  abstract: true,
  fields: (t) => ({
    kind: t.defaultValue(t.node('Kind'), {
      type: 'AnyKind',
    }),
    init: t.optional(t.node('Expression')),
  }),
});

Schema.define('Literal', {
  extends: 'Expression',
  fields: (t) => ({
    value: t.union(t.string, t.number, t.boolean),
  }),
});

Schema.define('String', {
  extends: 'Expression',
  fields: (t) => ({
    value: t.array(t.union(t.string, t.node('Expression'))),
  }),
});

Schema.define('Identifier', {
  extends: 'Expression',
  fields: (t) => ({
    name: t.string,
    external: t.defaultValue(t.boolean, false),
  }),
  annotations: (a, t) => ({
    identifiable: a.resolveProp(t.node('Identifiable')),
  }),
});

Schema.define('Val', {
  extends: 'Variable',
});

Schema.define('ArrayExpression', {
  extends: 'Expression',
  fields: (t) => ({
    elements: t.array(t.node('Expression')),
  }),
});

Schema.define('BinaryExpression', {
  extends: 'Expression',
  fields: (t) => ({
    left: t.node('Expression'),
    operator: t.enumeration(
      '+',
      '-',
      '*',
      '/',
      '!=',
      '==',
      '<',
      '<=',
      '>',
      '>=',
      '||',
      '&&',
      '??',
      '^',
      '%'
    ),
    right: t.node('Expression'),
  }),
});

Schema.define('ArrayExpression', {
  extends: 'Expression',
  fields: (t) => ({
    elements: t.array(t.node('Expression')),
  }),
});

Schema.define('ObjectExpression', {
  extends: 'Expression',
  fields: (t) => ({
    properties: t.map(t.node('Expression')),
  }),
});

Schema.define('Block', {
  extends: 'Expression',
  fields: (t) => ({
    statements: t.array(t.node('Expression')),
  }),
});

Schema.define('Param', {
  extends: 'Identifiable',
});

Schema.define('Func', {
  extends: 'Expression',
  fields: (t) => ({
    name: t.defaultValue(t.union(t.string, t.nullish), null),
    params: t.array(t.node('Param')),
    body: t.node('Block'),
  }),
});

Schema.define('CallExpression', {
  extends: 'Expression',
  fields: (t) => ({
    identifier: t.node('Identifier'),
    arguments: t.defaultValue(t.array(t.node('Expression')), []),
  }),
});

Schema.define('UnaryExpression', {
  extends: 'Expression',
  fields: (t) => ({
    operator: t.union(t.enumeration('-', '+')),
    argument: t.node('Expression'),
  }),
});

Schema.define('ConditionalExpression', {
  extends: 'Expression',
  fields: (t) => ({
    condition: t.node('Expression'),
    consequent: t.node('Expression'),
    alternate: t.node('Expression'),
  }),
});

Schema.define('IfStatement', {
  extends: 'Expression',
  fields: (t) => ({
    condition: t.node('Expression'),
    consequent: t.node('Block'),
  }),
});

Schema.define('Assignment', {
  extends: 'Expression',
  alias: ['Statement'],
  fields: (t) => ({
    left: t.union(t.node('Identifier'), t.node('MemberExpression')),
    operator: t.enumeration('=', '+=', '-=', '*=', '/=', '^=', '%='),
    right: t.node('Expression'),
  }),
});

Schema.define('MemberExpression', {
  extends: 'Expression',
  fields: (t) => ({
    object: t.union(t.node('Identifier'), t.node('MemberExpression')),
    property: t.node('Expression'),
  }),
});

Schema.define('ComponentProp', {
  extends: 'Variable',
  fields: (t) => ({
    bindable: t.defaultValue(t.boolean, false),
  }),
});

Schema.define('Component', {
  extends: 'Identifiable',
  abstract: true,
});

Schema.define('RekaComponent', {
  extends: 'Component',
  fields: (t) => ({
    template: t.defaultValue(t.union(t.nullish, t.node('Template')), null),
    state: t.array(t.node('Val')),
    props: t.array(t.node('ComponentProp')),
  }),
});

Schema.define('ExternalComponent', {
  extends: 'Component',
  fields: (t) => ({
    render: t.any,
    props: t.defaultValue(t.array(t.node('ComponentProp')), []),
  }),
});

Schema.define('PropBinding', {
  extends: 'Expression',
  fields: (t) => ({
    identifier: t.node('Identifier'),
  }),
});

Schema.define('Template', {
  extends: 'ASTNode',
  abstract: true,
  fields: (t) => ({
    props: t.defaultValue(t.map(t.node('Expression')), {}),

    if: t.defaultValue(t.union(t.node('Expression'), t.nullish), null),
    each: t.defaultValue(t.union(t.node('ElementEach'), t.nullish), null),
    classList: t.defaultValue(
      t.union(t.node('ObjectExpression'), t.nullish),
      null
    ),
  }),
});

Schema.define('SlottableTemplate', {
  abstract: true,
  extends: 'Template',
  fields: (t) => ({
    children: t.defaultValue(t.array(t.node('Template')), []),
  }),
});

Schema.define('FragmentTemplate', {
  abstract: true,
  extends: 'SlottableTemplate',
});

Schema.define('RootTemplate', {
  extends: 'FragmentTemplate',
});

Schema.define('TagTemplate', {
  extends: 'SlottableTemplate',
  fields: (t) => ({
    tag: t.string,
  }),
});

Schema.define('ComponentTemplate', {
  extends: 'SlottableTemplate',
  fields: (t) => ({
    component: t.node('Identifier'),
  }),
});

Schema.define('SlotTemplate', {
  extends: 'Template',
  fields: () => ({}),
});

Schema.define('ElementEachAlias', {
  extends: 'Identifiable',
});

Schema.define('ElementEachIndex', {
  extends: 'Identifiable',
});

Schema.define('ElementEach', {
  extends: 'ASTNode',
  fields: (t) => ({
    alias: t.node('ElementEachAlias'),
    index: t.defaultValue(t.union(t.node('ElementEachIndex'), t.nullish), null),
    iterator: t.node('Expression'),
  }),
});

Schema.define('View', {
  abstract: true,
  fields: (t) => ({
    key: t.string,
    template: t.node('Template', true),
    frame: t.string,
    owner: t.defaultValue(t.union(t.node('ComponentView'), t.nullish), null),
  }),
});

Schema.define('SlottableView', {
  abstract: true,
  extends: 'View',
  fields: (t) => ({
    children: t.defaultValue(t.array(t.node('View')), []),
  }),
});

Schema.define('TagView', {
  extends: 'SlottableView',
  fields: (t) => ({
    tag: t.string,
    props: t.map(t.any),
    bindings: t.map(t.func),
  }),
});

Schema.define('ComponentView', {
  abstract: true,
  extends: 'SlottableView',
  fields: (t) => ({
    component: t.node('Component'),
  }),
});

Schema.define('FragmentView', {
  extends: 'SlottableView',
});

Schema.define('FrameView', {
  extends: 'SlottableView',
});

Schema.define('RekaComponentView', {
  extends: 'ComponentView',
  fields: (t) => ({
    component: t.node('RekaComponent'),
    render: t.array(t.node('View')),
  }),
});

Schema.define('ExternalComponentView', {
  extends: 'ComponentView',
  fields: (t) => ({
    component: t.node('ExternalComponent'),
    props: t.map(t.any),
  }),
});

Schema.define('SlotView', {
  extends: 'View',
  fields: (t) => ({
    children: t.array(t.node('View')),
  }),
});

Schema.define('SystemView', {
  abstract: true,
  extends: 'View',
});

Schema.define('EachSystemView', {
  extends: 'SystemView',
  fields: (t) => ({
    children: t.array(t.node('View')),
  }),
});

Schema.define('ErrorSystemView', {
  extends: 'SystemView',
  fields: (t) => ({
    error: t.string,
  }),
});

Schema.define('ExtensionState', {
  fields: (t) => ({
    value: t.union(t.nullish, t.map(t.any)),
  }),
});

Schema.define('ExternalState', {
  extends: 'Identifiable',
  fields: (t) => ({
    init: t.any,
  }),
});

Schema.define('ExternalFunc', {
  extends: 'Identifiable',
  fields: (t) => ({
    func: t.func,
  }),
});
