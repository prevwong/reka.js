/* eslint-disable @next/next/no-css-tags */
import type { AppProps } from 'next/app';
import Head from 'next/head';
import * as React from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <React.Fragment>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />

        {/* Use Tailwind CDN so that tailwind classes used within our Reka component gets injected on-demand */}
        <script defer src="https://cdn.tailwindcss.com"></script>
      </Head>

      <Component {...pageProps} />
    </React.Fragment>
  );
}

export default MyApp;
