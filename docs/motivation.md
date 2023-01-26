# Motivation

Reka is built as an experimental state management system for Craft.js, a library for building drag-and-drop page builders. 

At the core of Craft.js is the `EditorState` which is a simple implicit tree data structure that represents the current state of the page that's being built by the end-user:

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

Reka is intended to replace the internal state management system of Craft.js to support the above features; while Craft.js itself would continue to provide higher-level functionalities for page builders such as drag-n-drop.