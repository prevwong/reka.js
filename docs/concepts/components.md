# Components

There're two types of Components :-
- `CompositeComponent` - components designed by end-users, these components are stored in `State`
- `ExternalComponent` - non-editable components exposed by page-builder developers 

## CompositeComponent

A `CompositeComponent` can define the `props` that it exposes, the `state` value it holds and its render `template`:

```tsx
{
    type: "CompositeComponent",
    name: "Button",
    props: [
        {
            type: "ComponentProp",
            name: "color",
            init: {
                type: "Literal",
                value: "blue",
            },
        },
    ],
    state: [
        {
            type: "Val",
            name: "counter",
            init: {
                type: "Literal",
                value: 0,
            }
        }
    ],
    template: {
        type: "TagTemplate",
        tag: "div",
        props: {},
        children: [],
        if: null,
        each: null,
    },
   
}
```

### Template

The `template` of a `CompositeComponent` supports all functionalities that you would typically have as a developer in an UI framework (ie: React).

For example, the props of a template can support expressions:

```tsx
{
    type: "TagTemplate",
    name: "div",
    props: {
        className: {
            type: "Identifier",
            name: "color"
        }
    },
    if: null, 
    each: null,
    children: []
}
```

Conditionally rendering can be achieved by specifing an expression to its `if` property:

```tsx
{
    type: "TagTemplate",
    name: "div",
    props: {...},
    if: {
        type: "BinaryExpression",
        left: "counter",
        operator: "==",
        right: 0
    },
    each: null,
    children: []
}
```

A `template` could be rendered multiple times by specifying an iterable variable in the  `each` property:

```tsx
{
    type: "TagTemplate",
    name: "div",
    props: {...},
    if: {...},
    each: {
        iterator: {
            type: "Identifier",
            name: "someArrayValue",
        },
        alias: "color",
        index: "i"
    },
    props: {
        className: {
            type: "Identifier",
            name: "color",
        },
    }
    children: []
}
```

Apart from specifying HTML tags in `template`, other Components can also be referenced like so: 

```tsx
{
    type: "TagTemplate",
    name: "div",
    props: {...},
    if: null,
    each: null,
    children: [
        {
            type: "ComponentTemplate",
            component: "Icon", // Where Icon is another CompositeComponent or an ExternalComponent
            props: {},
            children: []
        }
    ]
}
```

## ExternalComponent

An `ExternalComponent` is simply a component that exists outside of the `State`. These components are typically useful when you need to expose some predefined components that your end-users could reuse.

For example, let's imagine we have the following `Icon` React component:

```tsx
import * as icons from 'some-icon-library';

const Icon = ({ name, size }) => {
    return React.createElement(icons[name], {
        size,
    })
}
```

Now, we can expose `Icon` as an `ExternalComponent` so that it can be referenced by a template of a `CompositeComponent`: 

```tsx
{
    type: "CompositeComponent",
    ...
    template: {
        type: "TagTemplate",
        name: "div",
        props: {...},
        if: null,
        each: null,
        children: [
            {
                type: "ComponentTemplate",
                component: "Icon", // Where Icon is another CompositeComponent or an ExternalComponent
                props: {
                    size: "large",
                },
                children: []
            }
        ]
    }
}
```