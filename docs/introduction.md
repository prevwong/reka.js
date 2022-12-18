# Composite

Composite is a Javascript library for building UI components on the browser. 

> It's primarily built to eventually serve as the state management system to power Craft.js-based page builders.

## Motivation

Craft.js is a library for building drag-and-drop page builders. 

At the core of it is the `EditorState` which is a simple implicit tree data structure that represents the current state of the page that's being built by the end-user:

```tsx
{
    "ROOT": {
        type: "div",
        props: {...},
        nodes: ["node-a"],
    },
    "node-a": {
        type: "Button",
        props: {
            text: "Hello World!"
        }
        nodes: []
    }
}

// The above state can be rendered in React like so:
<div>
    <Button text="Hello World" />
</div>
```

Then, with Craft.js, you could build UIs that allows your end-user to add new elements, change an elements props etc -- and all that does is simply mutate the `EditorState` and in turn the rendered result in React gets updated as well. 

### Limitations

The original goal for building Craft.js was to build a library that could help developers to create any sort of page builder regardless of the complexity required. More complex page builders typically allows end-users to build complete UI components.

Let's first take a look at a simple UI component in React:
```tsx
const posts = [...];

const MyComponent = (props) => {
    const [counter, setCounter] = useState(0);

    return (
        <div>
            <h1>Hello World!</h1>
            {
                props.enabled && <p>I'm enabled!</p>
            }
            {
                counter > 0 && (
                    <h2>I'm non-negative!</h2>
                )
            }
            {
                posts.map(post => <h2>{post.name}</h2>)
            }
            <button 
            
                onClick={() => {
                    setCounter(counter + 1);
                }}>
                Increment
            </button>
        </div>
    )
}
```

A React component is able to do the following :-
- Render a HTML output based on the props given
- Supports JS expressions
- Hold stateful values
- Render an element conditionally based on an expression
- Iterate through an array and render an element multiple times for each item in the array

So, a more *complete* page builder would be one that allows the end-user to essentially build UI components as a developer would write a React component. In essence, this would mean a page builder would be a code editor but with UI abstractions.

Currently, Craft.js' `EditorState` essentially stores the template of a single App component, and allows end-users to reorder elements, and mutate static prop values of each elements in the state. However, much of what's possible with writing React code as listed above, is not easily-replicable with Craft.js.

# How it works

## State

The State is an AST that primarily stores the UI components designed by the end-user:

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
                ]
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
const Button = (props) => {
    const [counter, _] = useState(0);

    return (
        <button className="bg-blue-900">
            {counter}
            {props.enabled && "I'm enabled!"}
        </button>
    )
}
```

## Frame 

Now that we have a `State` with a list of user defined components, we need a way to render those components. But before we can do that, we need to know *what* to render. 

`Frame` is essentially an instance of a component defined in the `State` and it outputs a `View` 

For example, let's say we created a `Frame` for the Button component above with it's `enabled` prop set to true. Then, it's output `View` would be the following:

```tsx
{
    type: "ElementView",
    tag: "button",
    props: {
        className: "bg-blue-900",
    },
    children: [
        {
            type: "ElementView",
            tag: "text",
            props: {
                value: 0
            },
        },
        {
            type: "ElementView",
            tag: "text",
            props: {
                value: "I'm enabled!"
            }
        }
    ]
}
```


The `View` is essentially the resulting static output of a component. The `View` of a `Frame` is recomputed when the component’s definition in the state is updated or when a side effect (ie: mutating a global variable) is performed. 

### Applying changes on State changes

Apart from generating the `View` of a component from the state, a `Frame` is also responsible for keeping the `View` updated to any changes made to the state.

For example, let's say if we were to update a prop to the above Button component's root `<button>` element:

```tsx
{
    type: "CompositeComponent",
    props: [...],
    state: [...],
    template: {
        type: "TagTemplate",
        tag: "button",
        props: {
            "className": {
                type: "Literal",
                // value: "bg-blue-900", 
                value: "bg-green-900" // <-- updated value 
            }
        },
        children: [...]
    }
}
```

Then, the resulting output will be updated accordingly:

```tsx
{
    type: "ElementView",
    tag: "button",
    props: {
        className: "bg-green-900", // <-- updated 
    },
    children: [...]
}
```

## Rendering

When we create a  `Frame` for an instance of a component defined in the state, we now know *what* to render - the `View`. Now all that's left is to answer is - *how* to render the given `View`. 

Given that the `View` is essentially a serialisable JSON structure, we can easily build a renderer that takes the View and renders in whatever framework we want. For example we can easily create a React renderer like so:

```tsx
const Renderer = (props) => {
    if ( props.view.type === "ElementView" ) {
        return React.createElement(
            props.view.tag,
            props.view.props,
            props.view.children.map(child => <Renderer key={child.id} view={child} />)
        )
    }

    if ( props.view.type === "ComponentView" ) {
        return ...
    }

    return null;
} 
```
