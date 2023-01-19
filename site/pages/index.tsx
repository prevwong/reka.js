import { Parser } from '@rekajs/parser';
import * as React from 'react';

import { EditorLayout } from '../components/editor-layout';

if (typeof window !== 'undefined') {
  (window as any).parser = new Parser();
}

const App = () => {
  return <EditorLayout />;
};

export default App;
