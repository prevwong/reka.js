# Integration with React

In this guide, we'll build a simple React app to interact/manipulate the state of a Composite instance along with a renderer for Composite components. 

## Installation

We'll be using `next` to scaffold a React application. We'll also be using some React-specific APIs for Composite provided by the `@composite/react` package.

```
npm install next @composite/state @composite/types @composite/react
```

> `@composite/react` is still in a very early stage of development, much of its API is still subject to change and improvements 


## Basic setup

First we'll create a new Composite instance and load it with a very simple App component with just a "Hello World" text. 

We will expose this Composite instance so we can access it throughout our React application with the `CompositeProvider` React context provider.

Finally, we will create a new `<Editor />` component where we will provide some UI to interact with the Composite instance along with a `<Preview />` component that will render the components in our Composite instance:

```tsx
// src/pages/index.tsx
import * as React from 'react';

import * as t from '@composite/types';
import { Composite } from '@composite/state';
import { CompositeProvider } from '@composite/react';

import { Editor } from '@/components/Editor';
import { Preview } from '@/components/Preview';

export default function Home() {
  const [composite, setComposite] = React.useState<Composite | null>(null);

  React.useEffect(() => {
    const composite = new Composite();

    composite.load(
      t.state({
        extensions: {},
        program: t.program({
          globals: [
            t.val({
              name: 'globalText',
              init: t.literal({ value: 'Global Text!' }),
            }),
          ],
          components: [
            t.compositeComponent({
              name: 'App',
              props: [],
              state: [],
              template: t.tagTemplate({
                tag: 'div',
                props: {},
                children: [
                  t.tagTemplate({
                    tag: 'h4',
                    props: {},
                    children: [
                      t.tagTemplate({
                        tag: 'text',
                        props: {
                          value: t.literal({ value: 'Hello World' }),
                        },
                        children: [],
                      }),
                    ],
                  }),

                  t.componentTemplate({
                    component: t.identifier({ name: 'Button' }),
                    props: {},
                    children: [],
                  }),
                ],
              }),
            }),
            t.compositeComponent({
              name: 'Button',
              props: [
                t.componentProp({
                  name: 'text',
                  init: t.literal({ value: 'Click me!' }),
                }),
              ],
              state: [
                t.val({ name: 'counter', init: t.literal({ value: 0 }) }),
              ],
              template: t.tagTemplate({
                tag: 'button',
                props: {
                  onClick: t.func({
                    params: [],
                    body: t.block({
                      statements: [
                        t.assignment({
                          left: t.identifier({ name: 'counter' }),
                          operator: '+=',
                          right: t.literal({ value: 1 }),
                        }),
                      ],
                    }),
                  }),
                },
                children: [
                  t.tagTemplate({
                    tag: 'text',
                    props: {
                      value: t.binaryExpression({
                        left: t.identifier({ name: 'text' }),
                        operator: '+',
                        right: t.identifier({ name: 'counter' }),
                      }),
                    },
                    children: [],
                  }),
                ],
              }),
            }),
          ],
        }),
      })
    );

    setComposite(composite);
  }, []);

  if (!composite) {
    return null;
  }

  return (
    <CompositeProvider state={composite}>
      <div className="flex h-screen">
        <div className="w-3/6 h-full border-r-2">
          <Editor />
        </div>
        <div className="flex-1">
          <Preview />
        </div>
      </div>
    </CompositeProvider>
  );
}
```

## Preview 

Let's first start building the `<Preview />` component, which will essentially contain our renderer for the components we have in our Composite instance.

In order to render a `CompositeComponent`, we need to first have a `Frame`, which is essentially an instance of the component that computes a `View`, the render tree of that component. 

To keep this guide simple, we will just define a list of `Frame` to create, and provide a dropdown that lets us to switch between the frames that we have defined:

```tsx
import * as t from '@composite/types';

import * as React from 'react';

const FRAMES = [
    {
        id: 'Main App', 
        component: { 
            name: 'App', 
            props: {} 
        }
    },
    {
        id: 'Primary Button',
        component: { 
            name: 'Button', 
            props: {
                text: t.literal({ value: "A Primary Button!" }),
            }
        }
    }
];

export const Preview = () => {
    const [selectedFrameId, setSelectedFrameId] = React.useState<string>(FRAMES[0]);
     
    return (
        <div className="w-full h-full flex flex-col text-xs">
            <div className="px-2 py-2 border-b-2">
                <select onChange={value => setSelectedFrameId(value) }>
                    {FRAMES.map((frame) => (
                        <option key={frame.id} value={frame.id}>
                            {frame.id}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex-1">
                <div className="px-3 py-4">No frame selected</div>
            </div>
        </div>
    )
}
```

Next, we need to actually get the `Frame` in Composite depending on the frame that was selected from the list that we have defined locally:

```tsx
const FRAMES = [...];

export const Preview = () => {
    const { composite } = useComposite();
    const [selectedFrameId, setSelectedFrameId] = React.useState<string>(FRAMES[0].id);
    
    const selectedFrame = React.useMemo(() => {
        return FRAMES.find(frame => frame.id === selectedFrameId);
    }, [selectedFrameId])

    const selectedCompositeFrame = React.useMemo(() => {
        if ( !selectedFrame ) {
            return;
        }

        let compositeFrame = composite.frames.find(frame => frame.id === selectedFrame.id);

        // If the selected Frame does not exist in the Composite instance, create it
        if ( !compositeFrame ) {
            compositeFrame = composite.createFrame(selectedFrame);
        }

        return compositeFrame;
    }, [selectedFrame]);

    return (...)
}
```

Finally, once we have our Composite `Frame`, we can access its `View` and pass that to our renderer:

```tsx

export const Preview = () => {
  ...

  const selectedCompositeFrame = React.useMemo(() => {...}, [selectedFrame]);

  return (
    <div className="w-full h-full flex flex-col text-xs">
      <div className="px-2 py-2 border-b-2">
        <select
          onChange={(e) => {
            setSelectedFrameId(e.target.value);
          }}
        >
          {FRAMES.map((frame) => (
            <option key={frame.id} value={frame.id}>
              {frame.id}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        {selectedCompositeFrame?.view ? (
          <Renderer view={selectedCompositeFrame.view} />
        ) : (
          <div className="px-3 py-4">No frame selected</div>
        )}
      </div>
    </div>
  );
};
```

## Renderer

Next, lets create a Renderer for a `View` from a given `Frame`:

All we've to do here is go through each type of `View`, and return a corresponding React element:

```tsx
// src/components/Renderer.tsx
import { observer } from '@composite/react';
import { Frame } from '@composite/state';
import * as t from '@composite/types';
import * as React from 'react';

type RendererProps = {
  view: t.View;
};

export const Renderer = observer((props: RendererProps) => {
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

  if (props.view instanceof t.CompositeComponentView) {
    return props.view.render.map((r) => <Renderer key={r.id} view={r} />);
  }

  if (props.view instanceof t.ExternalComponentView) {
    return props.view.component.render(props.view.props);
  }

  if (props.view instanceof t.SlotView) {
    return props.view.view.map((r) => <Renderer key={r.id} view={r} />);
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
});

type RenderFrameProps = {
  frame: Frame;
};

export const RenderFrame = observer((props: RenderFrameProps) => {
  if (!props.frame.view) {
    return null;
  }

  return <Renderer view={props.frame.view} />;
});

```

> Composite's State is built with Mobx. The `observer` HOC used above is a re-export of the same HOC from the `mobx-react-lite` package.

![Renderer](/images/guides/react/renderer.gif)


## Editor

Now, lets create a simple Editor component that interacts with our `Composite` instance. We'll simply add a button that adds a new text template into our App `CompositeComponent`:

```tsx
// src/components/Editor.tsx
import * as t from '@composite/types';
import { useCollector } from '@composite/react';
import * as React from 'react';

export const Editor = () => {
  const { composite } = useCollector();

  return (
    <div>
      <button
        onClick={() => {
          const appComponent = composite.state.program.components.find(
            (component) => component.name === 'App'
          );

          if (!appComponent) {
            return;
          }

          composite.change(() => {
            appComponent.template.children.push(
              t.tagTemplate({
                tag: 'text',
                props: {
                  value: t.literal({ value: "I'm a new text template!" }),
                },
                children: [],
              })
            );
          });
        }}
      >
        Add a new text template
      </button>
    </div>
  );
};
```

![Code Editor](/images/guides/react/add-template.gif)


### Parser

Let's edit our previous example to create the text template with a value from a text input. 

Since the text value is a prop of a template; and template props are expressions, we will need to first add the the `@composite/parser` package to our project so we can parse user inputs into an expression AST Node.

```
npm install @composite/parser
```

Now let's go back and update our `Editor` component to include an input field with the Composite parser:

```tsx
...
import { Parser } from '@composite/parser';

export const Editor = () => {
    ...

    const [newTextValue, setNewTextValue] = React.useState('');

    return (
        <div>
            <input
                type="text"
                placeholder="New value"
                value={newTextValue}
                onChange={(e) => setNewTextValue(e.target.value)}
            />
            <button
                onClick={() => {
                    if (!newTextValue) {
                        return;
                    }

                    try {
                        const parsedTextValue = Parser.parseExpression(newTextValue);

                        const appComponent = composite.state.program.components.find(
                            (component) => component.name === 'App'
                        );

                        if (!appComponent) {
                            return;
                        }

                        composite.change(() => {
                            appComponent.template.children.push(
                                t.tagTemplate({
                                tag: 'text',
                                props: {
                                    value: parsedTextValue,
                                },
                                children: [],
                                })
                            );
                        });
                    } catch (err) {
                        console.warn(err);
                    }
                }}
            >
                Add a new text template
            </button>
        </div>
    )
}
```
![Parser](/images/guides/react/text-input2.gif)

Hence, to create a proper page editor with Composite, all we need to do is to create UI elements that mutate the Composite state like we did above. 

Of course, we could probably spend hours in this guide if we were to go through building every single UI element to edit the Composite state. Instead, we will end this guide by replacing the basic UI elements we made above with a code editor:

Let's add one more package:

```
npm install @composite/react-code-editor
```

Finally, let's update our Editor component:

```tsx
import { CodeEditor } from '@composite/react-code-editor';
import * as React from 'react';

export const Editor = () => {
  return (
    <div>
      <CodeEditor />
    </div>
  );
};
```

![Code Editor](/images/guides/react/code-editor.gif)

