import { Stringifier } from '@composite/parser';
import * as React from 'react';

import { Box } from '@app/components/box';
import { Header } from '@app/components/header';
import { EditorContextProvider } from '@app/editor';

import { EditorLayout } from '../components/editor-layout';

if (typeof window !== 'undefined') {
  (window as any).stringifier = new Stringifier();
}

const App = () => {
  return (
    <EditorContextProvider>
      <Box css={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header />
        <EditorLayout css={{ flex: 1 }} />
      </Box>
    </EditorContextProvider>
  );
};

export default App;
