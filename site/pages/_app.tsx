import { TooltipProvider } from '@radix-ui/react-tooltip';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import * as React from 'react';

import { Footer } from '@app/components/footer';
import { Header } from '@app/components/header';
import {
  SITE_LAYOUT_CLASSNAME,
  SITE_LAYOUT_CONTENT_CLASSNAME,
} from '@app/constants/css';
import { EditorContextProvider } from '@app/editor';
import { cn } from '@app/utils';

import '../styles/globals.css';

type PageOptions = {
  hideHeaderOnInitial: boolean;
  footer: boolean;
};

const getPageOptions = (options: Partial<PageOptions>): PageOptions => {
  return {
    hideHeaderOnInitial: false,
    footer: true,
    ...options,
  };
};

function MyApp({ Component, pageProps }: AppProps) {
  const loadedRef = React.useRef(false);

  const options = React.useMemo(
    () =>
      getPageOptions(
        // @ts-ignore
        Component['pageOptions'] || {}
      ),
    [Component]
  );

  return (
    <TooltipProvider delayDuration={200}>
      <EditorContextProvider>
        <Head>
          <title>Reka.js</title>
          <meta content="/social-banner.png" property="og:image" />
          <meta name="viewport" content="width=device-width" />
          <link rel="icon" type="image/png" href="/favicon.ico" />
        </Head>
        <div
          ref={(dom) => {
            const { current: loaded } = loadedRef;

            if (loaded || !dom || !options.hideHeaderOnInitial) {
              return;
            }

            loadedRef.current = true;
            dom.classList.add('hidden-header');
          }}
          className={cn(SITE_LAYOUT_CLASSNAME)}
        >
          <Header />
          <div className={SITE_LAYOUT_CONTENT_CLASSNAME}>
            <Component {...pageProps} />
            {options.footer && <Footer />}
          </div>
        </div>
      </EditorContextProvider>
    </TooltipProvider>
  );
}

export default MyApp;
