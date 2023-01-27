# Externals

While the end-user of your page builder could use the `Program` AST by itself to design some fairly complex components, you probably still may want to expose some additional functionalities.

An external is anything that is exposed to the end-user but is not defined in the `State`.

## External Component

The first type of externals are External Components, which is simply any component that exists outside of the `State`. These components are typically useful when you need to expose some predefined components that your end-users could reuse.

For example, let's imagine we have the following `Icon` React component:

```tsx
import * as icons from 'some-icon-library';

const Icon = ({ name, size }) => {
    return React.createElement(icons[name], {
        size,
    })
}
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

## External Globals

The next type of externals are External Globals. These are useful for when you need to expose some variables that could provide additional functionality for the end-users. For example, you could expose an external global that returns the current time:

```tsx
const reka = Reka.create({
    externals: {
        globals: self => ({
            getCurrentTime: (params) => {
                if ( params.format === 'now' ) {
                    return Date.now();
                }

                const date = new Date();

                if ( params.format === 'year' ) {
                    return date.getYear();
                }

                // return something else
            }
        })
    }
});

// Then the external global can be accessed within the Program AST like so:
{
    type: "RekaComponent",
    template: {
        type: "TagTemplate",
        name: "text",
        props: {
            value: t.binaryExpression({
                left: t.literal({ value: "Current year is: " }),
                operator: "+",
                right: t.externalGlobal({
                    name: "getCurrentTime", // <-- 
                    params: {
                        format: t.literal({ value: 'now' })
                    }
                })
            })
        }
    }
}
```

## External State

Finally, the last type of externals are External States. These're useful if you need to store a temporary stateful value that your end-users could reference.

For example, lets say you want your end-users to be able to do something with the current `scrollTop` position of the page:

```tsx
const reka = Reka.create({
    externals: {
        states: {
            scrollTop: 0,
        }
    }
});

window.addEventListener('scroll', () => {
    reka.updateExternalState('scrollTop', window.scrollTop)
});

// Then, the end-user could do something with the "scrollTop" external:
{
    type: "RekaComponent",
    template: {
        type: "TagTemplate",
        name: "div",
        children: [],
        // show this <div /> only if the scrollTop is more than 200px
        if: t.binaryExpression({
            left: t.identifier({ name: 'scrollTop' }),
            operator: '>=',
            right: t.literal({ value: 200 }) 
        })
    }
}
```