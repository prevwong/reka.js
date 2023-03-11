# Externals

While the end-user of your page builder could use the `Program` AST by itself to design some fairly complex components, you probably still may want to expose some additional functionalities.

An external is anything that is exposed to the end-user but is not defined in the `State`.

## External Component

The first type of externals is External Components, which is simply any component that exists outside of the `State`. These components are typically useful when you need to expose some predefined components that your end users could reuse.

For example, let's imagine we have the following `Icon` React component:

```tsx
import * as icons from 'some-icon-library';

const Icon = ({ name, size }) => {
  return React.createElement(icons[name], {
    size,
  });
};
```

Now, we can expose `Icon` as an `ExternalComponent` so that it can be referenced by a template of a `RekaComponent`:

```tsx
const Icon = ({ name, size }) => {...}

const reka = Reka.create({
    externals: {
        components: [
            t.externalComponent({
                name: 'Icon',
                render: (props) => {
                    return <Icon {...props} />
                }
            })
        ]
    }
});


// We can then reference the external component in the state like so:
{
    type: "RekaComponent",
    template: {
        type: "TagTemplate",
        name: "div",
        children: [
            {
                type: "ComponentTemplate",
                component: { type: "Identifier", name: "Icon" }, // Where Icon is an ExternalComponent
                props: {
                    size: "large",
                },
                children: []
            }
        ]
    }
}
```

## External Functions

The next type of externals is External Functions. These are useful when you need to expose functions that your end-users could call. For example, you could expose an external function that your users could use to return a random number:

```tsx
const reka = Reka.create({
    externals: {
        globals: self => ({
             getRandomNumber: (params) => {
                if ( params.strong === true ) {
                    return crypto.getRandomValues();
                }

                return Math.random();
            }
        })
    }
});

// Then the external function can be accessed within the Program AST like so:
{
    type: "RekaComponent",
    template: {
        type: 'TagTemplate",
        tag: 'div',
        props: {},
        children: [
            {
                type: "TagTemplate",
                name: "text",
                props: {
                    value: t.binaryExpression({
                        left: t.literal({ value: "Random number (via Math.random): " }),
                        operator: "+",
                        right: t.callExpression({
                            identifier: t.identifier({
                                name: "getRandomNumber", // <-- call external global
                                external: true,
                            }),
                            params: {}
                        })
                    })
                }
            },
            {
                type: "TagTemplate",
                name: "text",
                props: {
                    value: t.binaryExpression({
                        left: t.literal({ value: "Random number (via crypto): " }),
                        operator: "+",
                        right: t.callExpression({
                            identifier: t.identifier({
                                name: "getRandomNumber", // <-- call external global
                                external: true,
                            }),
                            params: {
                                strong: t.literal({ value: true }) // <- specify "strong" param = true, so we will use crypto.getRandomValues()
                            }
                        })
                    })
                }
            }
        ]
    }
}
```

## External State

Finally, the last type of externals is External States. These're useful if you need to store a temporary stateful value that your end-users could reference.

For example, let's say you want your end-users to be able to do something with the current `scrollTop` position of the page:

```tsx
const reka = Reka.create({
    externals: {
        states: {
            scrollTop: 0,
        },
        globals: self => ({
            getScrollTop: () => {
                return self.getExternalState('scrollTop')
            }
        })
    }
});

// Update the "scrollTop" external state on browser scroll
window.addEventListener('scroll', () => {
    reka.updateExternalState('scrollTop', window.scrollTop)
});

// Then, the end-user could do something with the "scrollTop" external state:
{
    type: "RekaComponent",
    template: {
        type: "TagTemplate",
        name: "div",
        children: [],
        // show this <div /> only if the scrollTop is more than 200px
        if: t.binaryExpression({
            left: t.callExpression({
                identifier: t.identifier({ name: 'getScrollTop', external: true }),
            }),
            operator: '>=',
            right: t.literal({ value: 200 })
        })
    }
}
```
