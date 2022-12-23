import { AnimatePresence, motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import { Box } from '@app/components/box';
import { useEditor } from '@app/editor';
import { EditorMode } from '@app/editor/Editor';
import { styled } from '@app/styles';

import { Button } from '../button';
import { Collaborators } from '../editor-panel/Collaborators';

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

const AppToolbar = () => {
  const editor = useEditor();

  return (
    <Box css={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Collaborators />
      <Button
        variant="secondary"
        css={{ py: '$3', px: '$4' }}
        onClick={() => {
          if (editor.mode === EditorMode.Code) {
            editor.setMode(EditorMode.UI);
            return;
          }
          editor.setMode(EditorMode.Code);
        }}
      >
        {editor.mode === EditorMode.Code ? 'Exit Code Editor' : 'Edit Code'}
      </Button>
    </Box>
  );
};

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
                transition={{
                  ease: [0.19, 1, 0.22, 1],
                  duration: 0.4,
                }}
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
  return (
    <React.Fragment>
      <Box
        css={{
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
          height: '50px',
          overflow: 'hidden',
        }}
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
              <a href="https://github.com/prevwong/composite" target="__blank">
                Github
              </a>
              <Link href="/docs/introduction">Documentation</Link>
            </Menu>
          </Box>

          <HeaderToolbars
            toolbars={{
              app: <AppToolbar />,
            }}
            renderToolbar={(path) => {
              if (path === '/') {
                return 'app';
              }

              return null;
            }}
          />
        </Box>
      </Box>
    </React.Fragment>
  );
});
