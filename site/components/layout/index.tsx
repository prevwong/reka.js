import { motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { useRouter } from 'next/router';
import * as React from 'react';

import { Footer } from '../footer';
import { Header, HEADER_HEIGHT } from '../header';

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
        className={`relative top-${HEADER_HEIGHT}px h-[calc(100vh-${HEADER_HEIGHT}px)]`}
      >
        {props.children}
        {router.pathname !== '/' && <Footer />}
      </motion.div>
    </React.Fragment>
  );
});
