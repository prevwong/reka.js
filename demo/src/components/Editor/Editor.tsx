import * as t from '@composite/types';
import { useCollector } from '@composite/react';
import { CodeEditor } from '@composite/react-code-editor';
import * as React from 'react';

export const Editor = () => {
  const { composite } = useCollector();

  return (
    <div className="w-full h-full px-4 py-4">
      <button
        className="rounded text-sm px-3 py-1 bg-neutral-500 text-white"
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
      {/* <CodeEditor className="w-full h-full text-sm" /> */}
    </div>
  );
};
