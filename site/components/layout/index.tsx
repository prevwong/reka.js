import Head from 'next/head';
import { useRouter } from 'next/router';
import * as React from 'react';

import { Box } from '../box';
import { Footer } from '../footer';
import { Header } from '../header';

type MetaProps = {
  title: string;
};

type LayoutProps = {
  meta?: Partial<MetaProps>;
  children?: React.ReactNode;
};

const SITE_TITLE = 'Composite';

export const Layout = (props: LayoutProps) => {
  const router = useRouter();

  return (
    <React.Fragment>
      <Head>
        <title>
          {props.meta?.title
            ? `${props.meta.title} - ${SITE_TITLE}`
            : SITE_TITLE}
        </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Header />
      <Box
        css={{
          position: 'relative',
          top: '50px',
          height: 'calc(100vh - 50px)',
        }}
      >
        {props.children}
        {router.pathname !== '/' && <Footer />}
      </Box>
    </React.Fragment>
  );
};
