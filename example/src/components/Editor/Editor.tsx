import { CodeEditor } from '@composite/react-code-editor';
import * as React from 'react';

export const Editor = () => {
  return (
    <div className="w-full h-full">
      <CodeEditor className="w-full h-full text-sm" />
    </div>
  );
};
