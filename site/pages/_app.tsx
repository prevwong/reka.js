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
  const layoutDomRef = React.useRef<HTMLDivElement | null>(null);

  const options = React.useMemo(
    () =>
      getPageOptions(
        // @ts-ignore
        Component['pageOptions'] || {}
      ),
    [Component]
  );

  const optionsRef = React.useRef(options);
  optionsRef.current = options;

  const loadedRef = React.useRef(false);

  React.useLayoutEffect(() => {
    const { current: loaded } = loadedRef;
    const { current: options } = optionsRef;
    const { current: layoutDom } = layoutDomRef;

    if (loaded) {
      return;
    }

    if (!layoutDom) {
      return;
    }

    if (!options.hideHeaderOnInitial) {
      return;
    }

    layoutDom.classList.add('hidden-header');
    loadedRef.current = true;
  }, []);

  return (
    <EditorContextProvider>
      <Head>
        <meta content="/social-banner.png" property="og:image" />
        <meta name="viewport" content="width=device-width" />
        <link rel="icon" type="image/png" href="/favicon.ico" />
      </Head>
      <div ref={layoutDomRef} className={SITE_LAYOUT_CLASSNAME}>
        <Header />
        <div className={SITE_LAYOUT_CONTENT_CLASSNAME}>
          <Component {...pageProps} />
          {options.footer && <Footer />}
        </div>
      </div>
    </EditorContextProvider>
  );
}

export default MyApp;
