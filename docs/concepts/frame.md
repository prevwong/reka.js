# Frame 

The  `State` defines a list of user defined components, but we need a way to render those components. But before we can do that, we need to know *what* to render. 

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

## Applying changes on State changes

Apart from generating the `View` of a component from the state, a `Frame` is also responsible for keeping the `View` updated to any changes made to the state.

For example, let's say if we were to update a prop to the above Button component's root `<button>` element:

```tsx
{
    type: "RekaComponent",
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

When we create a  `Frame` for an instance of a component defined in the state, we now know *what* to render - the `View`. Now all that's left is - *how* to render the given `View`. 

Given that the `View` is essentially a serialisable JSON structure, we can easily build a renderer that takes the View and renders in whatever framework we want. For example we can easily create a React renderer like so:

```tsx
const Renderer = ({ view }) => {
    if ( view.type === "ElementView" ) {
        if ( view.tag === 'text' ) {
            return view.props.value;
        }

        return React.createElement(
            view.tag,
            view.props,
            view.children.map(child => <Renderer key={child.id} view={child} />)
        )
    }

    if ( view.type === "ComponentView" ) {
        return <Renderer view={view.root} />
    }

    return null;
} 