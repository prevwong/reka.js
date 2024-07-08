import { Parser } from '@rekajs/parser';
import { useReka } from '@rekajs/react';
import { CodeEditor } from '@rekajs/react-code-editor';
import * as t from '@rekajs/types';
import * as React from 'react';

export const Editor = () => {
  const { reka } = useReka();

  const [newTextValue, setNewTextValue] = React.useState('');

  return (
    <div className="w-full h-full">
      <div className="px-3 py-2 bg-gray-100 flex gap-2 border-b-2">
        <input
          type="text"
          className="px-2 py-1 text-xs flex-1"
          placeholder="New value"
          value={newTextValue}
          onChange={(e) => setNewTextValue(e.target.value)}
        />
        <button
          className="text-xs px-2 py-1 rounded bg-blue-200 text-blue-600 disabled:opacity-25"
          disabled={!newTextValue}
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
                t.assert(appComponent.template, t.TagTemplate).children.push(
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
          Add text
        </button>
      </div>
      <CodeEditor className="w-full h-full text-sm" />
    </div>
  );
};
