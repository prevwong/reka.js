import { Schema } from './schema';

Schema.define('State', {
  fields: (t) => ({
    program: t.node('Program'),
    extensions: t.map(t.node('ExtensionState')),
  }),
});

Schema.define('ASTNode', {
  abstract: true,
});

Schema.define('Program', {
  extends: 'ASTNode',
  scope: true,
  fields: (t) => ({
    globals: t.array(t.node('Val')),
    components: t.array(t.node('RekaComponent')),
  }),
});

Schema.define('Expression', {
  extends: 'ASTNode',
  abstract: true,
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
  }),
});

Schema.define('Val', {
  extends: 'Expression',
  fields: (t) => ({
    name: t.string,
    init: t.node('Expression'),
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
      '&&'
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
    arguments: t.array(t.node('Expression')),
  }),
});

Schema.define('ExternalGlobal', {
  extends: 'Expression',
  fields: (t) => ({
    name: t.string,
    params: t.map(t.node('Expression')),
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
    left: t.node('Identifier'),
    operator: t.enumeration('=', '+=', '-='),
    right: t.node('Expression'),
  }),
});

Schema.define('MemberExpression', {
  extends: 'Expression',
  fields: (t) => ({
    object: t.union(t.node('Identifier'), t.node('MemberExpression')),
    property: t.node('Identifier'),
  }),
});

Schema.define('ComponentProp', {
  extends: 'ASTNode',
  fields: (t) => ({
    name: t.string,
    init: t.defaultValue(t.union(t.node('Expression'), t.nullish), null),
  }),
});

Schema.define('Component', {
  extends: 'ASTNode',
  abstract: true,
  fields: (t) => ({
    name: t.string,
  }),
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
    props: t.map(t.node('Expression')),
    children: t.array(t.node('Template')),
    if: t.defaultValue(t.union(t.node('Expression'), t.nullish), null),
    each: t.defaultValue(t.union(t.node('ElementEach'), t.nullish), null),
    classList: t.defaultValue(
      t.union(t.node('ObjectExpression'), t.nullish),
      null
    ),
  }),
});

Schema.define('TagTemplate', {
  extends: 'Template',
  fields: (t) => ({
    tag: t.string,
  }),
});

Schema.define('ComponentTemplate', {
  extends: 'Template',
  fields: (t) => ({
    component: t.node('Identifier'),
  }),
});

Schema.define('SlotTemplate', {
  extends: 'Template',
  fields: () => ({}),
});

Schema.define('ElementEach', {
  extends: 'ASTNode',
  fields: (t) => ({
    alias: t.node('Identifier'),
    index: t.defaultValue(t.union(t.node('Identifier'), t.nullish), null),
    iterator: t.node('Expression'),
  }),
});

Schema.define('View', {
  abstract: true,
  fields: (t) => ({
    key: t.string,
    template: t.node('Template', true),
  }),
});

Schema.define('TagView', {
  extends: 'View',
  fields: (t) => ({
    tag: t.string,
    children: t.array(t.node('View')),
    props: t.map(t.any),
  }),
});

Schema.define('ComponentView', {
  abstract: true,
  extends: 'View',
  fields: (t) => ({
    component: t.node('Component'),
  }),
});

Schema.define('RekaComponentView', {
  extends: 'ComponentView',
  fields: (t) => ({
    render: t.array(t.node('View')),
  }),
});

Schema.define('ExternalComponentView', {
  extends: 'ComponentView',
  fields: (t) => ({
    component: t.node('ExternalComponent'),
    props: t.map(t.union(t.string, t.number, t.boolean, t.func)),
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
