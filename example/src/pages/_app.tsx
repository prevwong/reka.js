/* eslint-disable @next/next/no-css-tags */
import type { AppProps } from 'next/app';
import Head from 'next/head';
import * as React from 'react';

import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <React.Fragment>
      <Head>
        <link href="/globals.css" rel="stylesheet" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Component {...pageProps} />
    </React.Fragment>
  );
}

export default MyApp;
