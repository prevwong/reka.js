# Integration with React

In this guide, we'll build a simple React app to interact/manipulate the state of a Reka instance along with a renderer for Reka components. 

## Installation

We'll be using `next` to scaffold a React application. We'll also be using some React-specific APIs for Reka provided by the `@rekajs/react` package.

```
npm install next @rekajs/core @rekajs/types @rekajs/react
```

> `@rekajs/react` is still in a very early stage of development, much of its API is still subject to change and improvements 


## Basic setup

First we'll create a new Reka instance and load it with a very simple App component with just a "Hello World" text. 

We will expose this Reka instance so we can access it throughout our React application with the `RekaProvider` React context provider.

Finally, we will create a new `<Editor />` component where we will provide some UI to interact with the Reka instance along with a `<Preview />` component that will render the components in our Reka instance:

```tsx
// src/pages/index.tsx
import * as React from 'react';

import * as t from '@rekajs/types';
import { Reka } from '@rekajs/core';
import { RekaProvider } from '@rekajs/react';

import { Editor } from '@/components/Editor';
import { Preview } from '@/components/Preview';

export default function Home() {
  const [reka, setReka] = React.useState<Reka | null>(null);

  React.useEffect(() => {
    const reka = new Reka();

    reka.load(
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
            t.rekaComponent({
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
            t.rekaComponent({
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

    setReka(reka);
  }, []);

  if (!reka) {
    return null;
  }

  return (
    <RekaProvider state={reka}>
      <div className="flex h-screen">
        <div className="w-3/6 h-full border-r-2">
          <Editor />
        </div>
        <div className="flex-1">
          <Preview />
        </div>
      </div>
    </RekaProvider>
  );
}
```

## Preview 

Let's first start building the `<Preview />` component, which will essentially contain our renderer for the components we have in our Reka instance.

In order to render a `RekaComponent`, we need to first have a `Frame`, which is essentially an instance of the component that computes a `View`, the render tree of that component. 

To keep this guide simple, we will just define a list of `Frame` to create, and provide a dropdown that lets us to switch between the frames that we have defined:

```tsx
import * as t from '@rekajs/types';

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

Next, we need to actually get the `Frame` in Reka depending on the frame that was selected from the list that we have defined locally:

```tsx
const FRAMES = [...];

export const Preview = () => {
    const { reka } = useReka();
    const [selectedFrameId, setSelectedFrameId] = React.useState<string>(FRAMES[0].id);
    
    const selectedFrame = React.useMemo(() => {
        return FRAMES.find(frame => frame.id === selectedFrameId);
    }, [selectedFrameId])

    const selectedRekaFrame = React.useMemo(() => {
        if ( !selectedFrame ) {
            return;
        }

        let rekaFrame = reka.frames.find(frame => frame.id === selectedFrame.id);

        // If the selected Frame does not exist in the Reka instance, create it
        if ( !rekaFrame ) {
            rekaFrame = reka.createFrame(selectedFrame);
        }

        return rekaFrame;
    }, [selectedFrame]);

    return (...)
}
```

Finally, once we have our Reka `Frame`, we can access its `View` and pass that to our renderer:

```tsx

export const Preview = () => {
  ...

  const selectedRekaFrame = React.useMemo(() => {...}, [selectedFrame]);

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
        {selectedRekaFrame?.view ? (
          <Renderer view={selectedRekaFrame.view} />
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
import { observer } from '@rekajs/react';
import { Frame } from '@rekajs/core';
import * as t from '@rekajs/types';
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

> Reka's State is built with Mobx. The `observer` HOC used above is a re-export of the same HOC from the `mobx-react-lite` package.

![Renderer](/images/guides/react/renderer.gif)


## Editor

Now, lets create a simple Editor component that interacts with our `Reka` instance. We'll simply add a button that adds a new text template into our App `RekaComponent`:

```tsx
// src/components/Editor.tsx
import * as t from '@rekajs/types';
import { useCollector } from '@rekajs/react';
import * as React from 'react';

export const Editor = () => {
  const { reka } = useCollector();

  return (
    <div>
      <button
        onClick={() => {
          const appComponent = reka.state.program.components.find(
            (component) => component.name === 'App'
          );

          if (!appComponent) {
            return;
          }

          reka.change(() => {
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

Since the text value is a prop of a template; and template props are expressions, we will need to first add the the `@rekajs/parser` package to our project so we can parse user inputs into an expression AST Node.

```
npm install @rekajs/parser
```

Now let's go back and update our `Editor` component to include an input field with the Reka parser:

```tsx
...
import { Parser } from '@rekajs/parser';

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

                        const appComponent = reka.state.program.components.find(
                            (component) => component.name === 'App'
                        );

                        if (!appComponent) {
                            return;
                        }

                        reka.change(() => {
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

Hence, to create a proper page editor with Reka, all we need to do is to create UI elements that mutate the Reka state like we did above. 

Of course, we could probably spend hours in this guide if we were to go through building every single UI element to edit the Reka state. Instead, we will end this guide by replacing the basic UI elements we made above with a code editor:

Let's add one more package:

```
npm install @rekajs/react-code-editor
```

Finally, let's update our Editor component:

```tsx
import { CodeEditor } from '@rekajs/react-code-editor';
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

