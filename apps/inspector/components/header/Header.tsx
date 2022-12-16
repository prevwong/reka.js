import { observer } from 'mobx-react-lite';
import Image from 'next/image';
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

export const Header = observer(() => {
  const editor = useEditor();

  return (
    <React.Fragment>
      <Box
        css={{
          backgroundColor: '#fff',
          backdropFilter: 'blur(5px)',
          color: '$grayA12',
          px: '$4',
          py: '$3',
          borderBottom: '1px solid $grayA5',
        }}
      >
        <Box css={{ display: 'flex', ai: 'center' }}>
          <Box css={{ display: 'flex', flex: 1, ai: 'center' }}>
            <Box css={{ ml: '$2' }}>
              <Image src="/logo.svg" width={30} height={30} />
            </Box>
            <Menu>
              <a href="https://github.com/prevwong/composite" target="__blank">
                Github
              </a>
              <a href="#">Documentation</a>
            </Menu>
          </Box>
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
              {editor.mode === EditorMode.Code
                ? 'Exit Code Editor'
                : 'Edit Code'}
            </Button>
          </Box>
        </Box>
      </Box>
    </React.Fragment>
  );
});
