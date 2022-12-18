import type { AppProps } from 'next/app';
import * as React from 'react';

import { Layout } from '@app/components/layout';
import { EditorContextProvider } from '@app/editor';

import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <EditorContextProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </EditorContextProvider>
  );
}

export default MyApp;
