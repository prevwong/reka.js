import { AnimatePresence, motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import { Box } from '@app/components/box';
import { useMaybeEditor } from '@app/editor';
import { styled } from '@app/styles';
import { CREATE_BEZIER_TRANSITION } from '@app/utils';

import { ToolbarApp } from './ToolbarApp';
import { ToolbarDoc } from './ToolbarDoc';

export const HEADER_HEIGHT = 50;

const Container = styled(motion.div, {
  backgroundColor: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(10px)',
  color: '$grayA12',
  px: '$4',
  py: '$3',
  borderBottom: '1px solid $grayA5',
  position: 'fixed',
  top: 0,
  zIndex: '$4',
  width: '100%',
  height: `${HEADER_HEIGHT}px`,
  overflow: 'hidden',
});

const Menu = styled('div', {
  display: 'flex',
  gap: '$4',
  ml: '$5',
  '> a': {
    fontSize: '$2',
    cursor: 'pointer',
    textDecoration: 'none',
    color: '$slate12',
  },
});

type HeaderToolbarProps<T extends Record<string, React.ReactElement>> = {
  toolbars: T;
  renderToolbar: (path: string) => keyof T | null;
};

const HeaderToolbars = <T extends Record<string, React.ReactElement>>(
  props: HeaderToolbarProps<T>
) => {
  const router = useRouter();
  const c = props.renderToolbar(router.asPath);

  return (
    <React.Fragment>
      {Object.keys(props.toolbars).map((key) => {
        return (
          <AnimatePresence key={key} initial={false}>
            {c === key && (
              <motion.div
                animate="enter"
                initial="exit"
                exit="exit"
                style={{ position: 'relative' }}
                variants={{
                  enter: {
                    right: '0px',
                    opacity: 1,
                  },
                  exit: {
                    right: '-10px',
                    opacity: 0,
                  },
                }}
                transition={CREATE_BEZIER_TRANSITION()}
              >
                {props.toolbars[key]}
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}
    </React.Fragment>
  );
};

export const Header = observer(() => {
  const editor = useMaybeEditor();

  return (
    <Container
      initial="exit"
      animate={!editor ? 'enter' : editor.ready ? 'enter' : 'exit'}
      variants={{
        enter: {
          marginTop: 0,
          opacity: 1,
        },
        exit: {
          marginTop: `-${HEADER_HEIGHT}px`,
          opacity: 0,
        },
      }}
      transition={CREATE_BEZIER_TRANSITION()}
    >
      <Box css={{ display: 'flex', ai: 'center' }}>
        <Box css={{ display: 'flex', flex: 1, ai: 'center' }}>
          <Box css={{ ml: '$2' }}>
            <Link href="/">
              <Image
                src="/logo.svg"
                width={30}
                height={30}
                style={{ cursor: 'pointer' }}
              />
            </Link>
          </Box>
          <Menu>
            <a href="https://github.com/prevwong/reka.js" target="__blank">
              Github
            </a>
            <Link href="/docs/introduction">Documentation</Link>
          </Menu>
        </Box>

        <HeaderToolbars
          toolbars={{
            app: <ToolbarApp />,
            doc: <ToolbarDoc />,
          }}
          renderToolbar={(path) => {
            if (path === '/') {
              return 'app';
            }

            if (path.match(/^\/docs\/(.*)$/)) {
              return 'doc';
            }

            return null;
          }}
        />
      </Box>
    </Container>
  );
});
