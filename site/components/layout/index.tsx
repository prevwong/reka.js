import { motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { useRouter } from 'next/router';
import * as React from 'react';

import { useMaybeEditor } from '@app/editor';
import { styled } from '@app/styles';
import { CREATE_BEZIER_TRANSITION } from '@app/utils';

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

const Content = styled(motion.div, {
  position: 'relative',
  top: '50px',
  height: 'calc(100vh - 50px)',
});

export const Layout = observer((props: LayoutProps) => {
  const router = useRouter();
  const editor = useMaybeEditor();

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
      <Content
        initial="initial"
        animate={!editor ? 'setup' : editor.ready ? 'setup' : 'initial'}
        variants={{
          initial: {
            top: 0,
            height: '100vh',
          },
          setup: {
            top: HEADER_HEIGHT,
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
          },
        }}
        transition={CREATE_BEZIER_TRANSITION()}
      >
        {props.children}
        {router.pathname !== '/' && <Footer />}
      </Content>
    </React.Fragment>
  );
});
