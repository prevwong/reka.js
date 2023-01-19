import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { Box } from '@app/components/box';
import { Button } from '@app/components/button';
import { CodeEditor } from '@app/components/code-editor';
import { Text } from '@app/components/text';
import { Tree } from '@app/components/tree';
import { useEditor } from '@app/editor';
import { styled } from '@app/styles';

import { Collaborators } from './Collaborators';

import { Header } from '../header';

const StyledEditorPanelContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  borderRadius: '$1',
  overflow: 'auto',
  background: '$whiteA12',
  boxShadow: '0px 3px 42px -27px rgb(0 0 0 / 32%)',
});

const StyledEditorPanelTopbar = styled('div', {
  position: 'sticky',
  top: 0,
  zIndex: 999,
});

const StyledPanel = styled('div', {
  backgroundColor: 'rgb(255 255 255 / 60%)',
  backdropFilter: 'blur(5px)',
  px: '$3',
  py: '$1',
  color: '$grayA12',
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid',
  borderColor: '$grayA4',
});

export const EditorPanel = observer(() => {
  const editor = useEditor();
  const [editView, setEditView] = React.useState<'ast' | 'code'>('code');

  return (
    <StyledEditorPanelContainer>
      <StyledEditorPanelTopbar>
        <Header />
        <StyledPanel>
          <Box css={{ flex: 1, display: 'flex', ai: 'center' }}>
            <Text size={2} css={{ fontWeight: '500' }}>
              {editView === 'ast' ? 'Abstract Syntax Tree' : 'Code'}
            </Text>
            <Collaborators />
          </Box>
          <Box>
            <Button css={{}} onClick={() => editor.toggleConnected()}>
              {editor.connected ? 'Disconnect' : 'Connect'}
            </Button>
          </Box>
          <Box>
            <Button
              css={{
                ml: '$1',
              }}
              variant="secondary"
              onClick={() => {
                setEditView(editView === 'code' ? 'ast' : 'code');
              }}
            >
              {editView === 'code' ? 'View AST' : 'Edit Code'}
            </Button>
          </Box>
        </StyledPanel>
      </StyledEditorPanelTopbar>
      <Box
        css={{
          flex: 1,
        }}
      >
        <Tree
          css={{
            display: editView === 'ast' ? 'block' : 'none',
            py: '$2',
            px: '$0',
          }}
          root={editor.reka.program}
        />
        <CodeEditor
          css={{
            display: editView === 'ast' ? 'none' : 'block',
          }}
        />
      </Box>
    </StyledEditorPanelContainer>
  );
});
