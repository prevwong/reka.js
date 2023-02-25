import { motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { useRouter } from 'next/router';
import * as React from 'react';

import { styled } from '@app/styles';

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

const Content = styled(motion.div, {
  position: 'relative',
  top: '50px',
  height: 'calc(100vh - 50px)',
});

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
      <Content>
        {props.children}
        {router.pathname !== '/' && <Footer />}
      </Content>
    </React.Fragment>
  );
});
