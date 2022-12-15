import { Stringifier } from '@composite/parser';
import Head from 'next/head';
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
      <Head>
        <title>Composite</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Box css={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header />
        <EditorLayout css={{ flex: 1 }} />
      </Box>
    </EditorContextProvider>
  );
};

export default App;
