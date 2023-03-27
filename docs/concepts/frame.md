# Frame

The `State` defines a list of user-defined components, but we need a way to render those components. But before we can do that, we need to know _what_ to render.

`Frame` is essentially an instance of a component defined in the `State` and it outputs a `View`

For example, let's say we created a `Frame` for the Button component above with its `enabled` prop set to true. Then, its output `View` would be the following:

```tsx
{
    type: "TagView",
    tag: "button",
    props: {
        className: "bg-blue-900",
    },
    children: [
        {
            type: "TagView",
            tag: "text",
            props: {
                value: 0
            },
        },
        {
            type: "TagView",
            tag: "text",
            props: {
                value: "I'm enabled!"
            }
        }
    ]
}
```

The `View` is essentially the resulting static output of a component. The `View` of a `Frame` is recomputed when the component’s definition in the state is updated or when a side effect (ie: mutating a global variable) is performed.

## Keeping the View updated

Apart from generating the `View` of a component from the state, a `Frame` is also responsible for keeping the `View` updated on any changes made to the state.

For example, let's say we were to update a prop to the above Button component's root `<button>` element:

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
    type: "TagView",
    tag: "button",
    props: {
        className: "bg-green-900", // <-- updated
    },
    children: [...]
}
```

## Rendering

When we create a `Frame` for an instance of a component defined in the state, we now know _what_ to render - the `View`. Now all that's left is - _how_ to render the given `View`.

Given that the `View` is essentially a serializable JSON structure, we can easily build a renderer that takes the View and renders it in whatever framework we want. For example, we can easily create a React renderer like so:

```tsx
const Renderer = ({ view }) => {
  if (props.view instanceof t.TagView) {
    if (props.view.tag === 'text') {
      return <span>{props.view.props.value}</span>;
    }

    return React.createElement(
      props.view.tag,
      props.view.props,
      props.view.children.map((child) => (
        <Renderer key={child.id} view={child} />
      ))
    );
  }

  if (props.view instanceof t.RekaComponentView) {
    return props.view.render.map((r) => <Renderer key={r.id} view={r} />);
  }

  if (props.view instanceof t.ExternalComponentView) {
    return props.view.component.render(props.view.props);
  }

  if (props.view instanceof t.SlotView) {
    return props.view.children.map((r) => <Renderer key={r.id} view={r} />);
  }

  if (props.view instanceof t.ErrorSystemView) {
    return (
      <div className="">
        Something went wrong. <br />
        {props.view.error}
      </div>
    );
  }

  return null;
};
```
