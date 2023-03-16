import { motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { useRouter } from 'next/router';
import * as React from 'react';

import theme from '@app/constants/theme';

import { Footer } from '../footer';
import { Header } from '../header';

type MetaProps = {
  title: string;
};

type LayoutProps = {
  meta?: Partial<MetaProps>;
  children?: React.ReactNode;
};

const SITE_TITLE = 'Reka.js';

export const Layout = observer((props: LayoutProps) => {
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
      <motion.div
        className={`relative top-${theme.height.header}px h-[calc(100vh-${theme.height.header}px)]`}
      >
        {props.children}
        {router.pathname !== '/' && <Footer />}
      </motion.div>
    </React.Fragment>
  );
});
