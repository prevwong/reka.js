import {
  CodeEditor as ReactCodeEditor,
  ParserStatus,
} from '@composite/react-code-editor';
import { motion } from 'framer-motion';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { styled } from '@app/styles';

import { ParserStatusBadge } from './ParserStatusBadge';

import { Box } from '../box';
import { Tree } from '../tree';

const StyledReactCodeEditor = styled(ReactCodeEditor, {
  height: '100%',
  flex: 1,
});

const StyledTabItem = styled('button', {
  px: '$4',
  py: '$3',
  position: 'relative',
  cursor: 'pointer',
  fontSize: '$1',
  '&:hover': {
    backgroundColor: '$grayA2',
  },
});

const StyledTabItemUnderline = styled(motion.div, {
  position: 'absolute',
  bottom: '-1px',
  left: 0,
  width: '100%',
  height: '1px',
  background: '#000',
});

type CodeEditorProps = React.ComponentProps<typeof StyledReactCodeEditor>;

const tabs = [
  {
    id: 'code',
    title: 'Code',
  },
  {
    id: 'ast',
    title: 'Syntax Tree',
  },
] as const;

export const CodeEditor = ({ css, ...props }: CodeEditorProps) => {
  const [currentTab, setCurrentTab] =
    React.useState<typeof tabs[number]['id']>('code');

  const [status, setStatus] = React.useState<ParserStatus>({
    type: 'success',
  });
  const editor = useEditor();

  return (
    <Box css={{ ...css, height: '100%' }} {...props}>
      <Box css={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          css={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid $grayA5',
          }}
        >
          <Box css={{ flex: 1 }}>
            {tabs.map((tab) => (
              <StyledTabItem
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id);
                }}
              >
                {tab.title}
                {currentTab === tab.id && (
                  <StyledTabItemUnderline layoutId="underline"></StyledTabItemUnderline>
                )}
              </StyledTabItem>
            ))}
          </Box>
          <Box
            css={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              px: '$4',
              py: '$2',
            }}
          >
            <ParserStatusBadge status={status} />
          </Box>
        </Box>
        <Box
          css={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            css={{
              height: '100%',
              display: currentTab === 'code' ? 'block' : 'none',
            }}
          >
            <StyledReactCodeEditor
              onStatusChange={(status) => {
                setStatus(status);
              }}
            />
          </Box>
          <Box
            css={{
              overflow: 'auto',
              py: '$4',
              display: currentTab === 'ast' ? 'block' : 'none',
            }}
          >
            <Tree root={editor.composite.program} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
