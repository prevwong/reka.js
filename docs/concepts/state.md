# State

At the core of Composite is its `State` which is a data structure used to store :- 
- Components and global variables that the end user has created; this part of the state is called the `Program`
- Any additional state data stored by an Extension.

For now, we will focus on `Program` - an [Abstract Syntax Tree (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) with a grammar that enables us to define and store end-user components that are nearly as complex as components that developers would typically write in code.

## Component

A Component designed by an end-user that's stored in `Program` is called a `CompositeComponent`.

Here's an example of a simple Button component stored in the state:

```tsx
{
    type: "State",
    program: {
        type: "Program",
        components: [
            {
                type: "CompositeComponent",
                name: "Button",
                props: [
                    {
                        type: "ComponentProp",
                        name: "enabled"
                    }
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
                    tag: "button",
                    props: {
                        className: {
                            type: "Literal",
                            value: "bg-blue-900",
                        }
                    },
                    children: [
                        {
                            type: "TagTemplate",
                            tag: "text",
                            props: {
                                value: {
                                    type: "Identifier",
                                    name: "counter",
                                }
                            }
                        },
                        {
                            type: "TagTemplate",
                            tag: "text",
                            if: {
                                type: "Identifier",
                                name: "enabled"
                            },
                            props: {
                                value: {
                                    type: "Identifier",
                                    name: "counter",
                                }
                            }
                        }
                    ]
                }
            }
        ]
    }
}
```

In the above example, we have a very basic Button component that would look something like the following if it was written with React: 

```tsx
const Button = ({ enabled }) => {
    const [counter, _] = useState(0);

    return (
        <button className="bg-blue-900">
            {counter}
            {enabled && "I'm enabled!"}
        </button>
    )
}
```

## Globals

Optionally, we can also define global variables that can be referenced throughout the `Program`: 

```tsx
{
    type: "State",
    program: {
        type: "Program",
        globals: [
            {
                type: "Val",
                name: "globalCounter",
                init: {
                    type: "Literal",
                    value: 0,
                }
            }
        ],
        components: [
            {
                type: "CompositeComponent",
                name: "Button",
                props: [...],
                state: [...]
                template: {
                    type: "TagTemplate",
                    tag: "button",
                    props: {
                        className: {
                            type: "Literal",
                            value: "bg-blue-900",
                        }
                    },
                    children: [
                        {
                            type: "TagTemplate",
                            tag: "text",
                            props: {
                                value: {
                                    type: "Identifier",
                                    name: "globalCounter", // <--
                                }
                            }
                        },
                    ]
                }
            }
        ]
    }
}
```

If you're coming from React, these globals are more akin to stateful values stored in React Context:

```tsx
const GlobalCounterContext = React.createContext();

const GlobalCounterContextProvider = ({ children }) => {
    const [value, setValue] = React.useState(0);

    return (
        <GlobalCounterContext.Provider value={value, setValue}>
            {children}
        </GlobalCOunterContext.Provider>
    )
}

const Button = (props) => {
    const globalCounter = React.useContext(GlobalCounterContext);

    return (
        <button className="bg-blue-900">
            {globalCounter}
        </button>
    )
}
```