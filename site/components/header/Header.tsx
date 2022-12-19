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

export const Header = observer(() => {
  const router = useRouter();

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
          zIndex: '$1',
          width: '100%',
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
          <Box>{router.pathname === '/' && <AppToolbar />}</Box>
        </Box>
      </Box>
    </React.Fragment>
  );
});
