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

import '../styles/globals.scss';

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
  const [loaded, setLoaded] = React.useState(false);

  const loadedRef = React.useRef(loaded);
  loadedRef.current = loaded;

  const options = React.useMemo(
    () =>
      getPageOptions(
        // @ts-ignore
        Component['pageOptions'] || {}
      ),
    [Component]
  );

  React.useEffect(() => {
    setLoaded(true);
  }, [setLoaded]);

  const layoutClassnameRef = React.useRef(
    cn(SITE_LAYOUT_CLASSNAME, options.hideHeaderOnInitial && 'hidden-header')
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
          className={layoutClassnameRef.current}
          style={{ opacity: loaded ? 1 : 0 }}
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
