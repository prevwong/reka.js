import Head from 'next/head';
import * as React from 'react';

import { Box } from '../box';
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
  return (
    <React.Fragment>
      <Head>
        <title>
          {props.meta?.title
            ? `${props.meta.title} - ${SITE_TITLE}`
            : SITE_TITLE}
        </title>
        <link href="/tailwind.css" rel="stylesheet" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Box css={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header />
        <Box css={{ marginTop: '50px', height: '100%' }}>{props.children}</Box>
      </Box>
    </React.Fragment>
  );
};
