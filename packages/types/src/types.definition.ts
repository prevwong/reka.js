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

Schema.define('PrimitiveKind', {
  extends: 'Kind',
  fields: (t) => ({
    primitive: t.enumeration('string', 'number', 'boolean'),
  }),
});

Schema.define('ArrayKind', {
  extends: 'Kind',
  fields: (t) => ({
    kind: t.node('Kind'),
  }),
});

Schema.define('OptionKind', {
  extends: 'Kind',
  fields: (t) => ({
    options: t.map(t.string),
  }),
});

Schema.define('Expression', {
  extends: 'ASTNode',
  abstract: true,
});

Schema.define('Variable', {
  extends: 'Expression',
  abstract: true,
  fields: (t) => ({
    name: t.string,
  }),
});

Schema.define('Literal', {
  extends: 'Expression',
  fields: (t) => ({
    value: t.union(t.string, t.number, t.boolean),
  }),
});

Schema.define('Identifier', {
  extends: 'Expression',
  fields: (t) => ({
    name: t.string,
    external: t.defaultValue(t.boolean, false),
  }),
});

Schema.define('Val', {
  extends: 'Variable',
  fields: (t) => ({
    init: t.node('Expression'),
    kind: t.optional(t.node('Kind')),
  }),
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

Schema.define('Func', {
  extends: 'Expression',
  fields: (t) => ({
    name: t.defaultValue(t.union(t.string, t.nullish), null),
    params: t.array(t.node('Identifier')),
    body: t.node('Block'),
  }),
});

Schema.define('CallExpression', {
  extends: 'Expression',
  fields: (t) => ({
    identifier: t.node('Identifier'),
    params: t.defaultValue(t.map(t.node('Expression')), {}),
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
    init: t.defaultValue(t.union(t.node('Expression'), t.nullish), null),
    kind: t.optional(t.node('Kind')),
  }),
});

Schema.define('Component', {
  extends: 'Variable',
  abstract: true,
});

Schema.define('RekaComponent', {
  extends: 'Component',
  fields: (t) => ({
    template: t.node('Template'),
    state: t.array(t.node('Val')),
    props: t.array(t.node('ComponentProp')),
  }),
});

Schema.define('ExternalComponent', {
  extends: 'Component',
  fields: (t) => ({
    render: t.type('Function'),
  }),
});

Schema.define('Template', {
  extends: 'Expression',
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
  extends: 'Variable',
});

Schema.define('ElementEachIndex', {
  extends: 'Variable',
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
  }),
});

Schema.define('ComponentView', {
  abstract: true,
  extends: 'SlottableView',
  fields: (t) => ({
    component: t.node('Component'),
  }),
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
  extends: 'Variable',
  fields: (t) => ({
    init: t.any,
  }),
});

Schema.define('ExternalFunc', {
  extends: 'Variable',
  fields: (t) => ({
    func: t.func,
  }),
});
