import * as React from 'react';

import { styled } from '@app/styles';
import { Box } from '@app/components/box';
import Image from 'next/image';
import { Button } from '../button';
import { Collaborators } from '../editor-panel/Collaborators';
import { useEditor } from '@app/editor';
import { EditorMode } from '@app/editor/Editor';
import { observer } from 'mobx-react-lite';

const LogoText = styled('h2', {
  fontWeight: '500',
  fontSize: '$3',
});

// const StyledLogoIcon = styled(LogoIcon, {
//   width: '20px',
//   height: 'auto',
// });

export const Header = observer(() => {
  const editor = useEditor();

  return (
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
        <Box css={{ display: 'flex', flex: 1 }}>
          <Box css={{ ml: '$2' }}>
            <Image src="/logo.svg" width={30} height={30} />
          </Box>
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
            {editor.mode === EditorMode.Code ? 'Use Editor' : 'View Code'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
});
