import * as React from 'react';
import { styled } from '@app/styles';
import { useEditor } from '@app/editor';
import { UserFrameExtension } from '@app/extensions/UserFrameExtension';
import { DebugFrame } from '../frame';
import { SettingsEditor } from '../settings-editor';
import { CodeEditor } from '../code-editor';
import { AnimatePresence, motion } from 'framer-motion';
import { EditorMode } from '@app/editor/Editor';
import { observer } from 'mobx-react-lite';
import { useCollector } from '@composite/react';

import { LeftSettingsEditor } from '../settings-editor/LeftSettingsEditor';
import { Text } from '../text';
import { Box } from '../box';
import { ComponentEditorView } from './ComponentEditorView';

const StyledScreen = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  overflow: 'hidden',
  background: '$grayA4',
  position: 'relative',
});

const StyledFramesContainer = styled(motion.div, {
  display: 'flex',
});

const StyledFramesGrid = styled(motion.div, {
  display: 'grid',
  gap: '1px',
  '--grid-layout-gap': '1px',
  '--grid-column-count': '2',
  '--gap-count': 'calc(var(--grid-column-count) - 1)',
  '--total-gap-width': 'calc(var(--gap-count) * var(--grid-layout-gap))',
  '--grid-item--min-width': '200px',
  '--grid-item--max-width':
    'calc((100% - var(--total-gap-width)) / var(--grid-column-count))',
  'grid-template-columns':
    'repeat(auto-fill, minmax(max(var(--grid-item--min-width), var(--grid-item--max-width)), 1fr))',
  width: '100%',
  overflow: 'scroll',
  [`& ${DebugFrame}`]: {
    minHeight: '50vh',
  },
});

const StyledSidebarContainer = styled(motion.div, {
  width: '300px',
  background: '#fff',
  borderLeft: '1px solid $grayA5',
  position: 'relative',
  right: 0,
  height: '100%',
});

const StyledCodeContainer = styled(motion.div, {
  position: 'absolute',
  top: 0,
  right: 0,
  background: '#fff',
  borderLeft: '1px solid $grayA4',
  boxShadow: '0px 3px 68px 1px rgb(0 0 0 / 20%)',
  width: '500px',
  height: '100%',
});

const StyledFrameView = styled(motion.div, {
  flex: 1,
  background: '#fff',
  height: '100%',
});

const EmptyFrameMessage = (props: any) => {
  return (
    <Box
      css={{
        height: '100%',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text css={{ color: '$grayA9' }}>{props.message}</Text>
    </Box>
  );
};

export const EditorLayout = observer(
  (props: React.ComponentProps<typeof StyledScreen>) => {
    const editor = useEditor();

    return (
      <StyledScreen {...props}>
        <AnimatePresence initial={false}>
          <LeftSettingsEditor />
          <StyledFrameView>
            <ComponentEditorView />
          </StyledFrameView>
          <AnimatePresence initial={false}>
            {editor.mode === EditorMode.UI && (
              <StyledSidebarContainer
                key="sidebar"
                initial="hide"
                animate="show"
                exit="hide"
                variants={{
                  show: { right: 0 },
                  hide: { right: '-100%' },
                }}
                transition={{
                  ease: [0.19, 1, 0.22, 1],
                  duration: 0.4,
                }}
              >
                <SettingsEditor />
              </StyledSidebarContainer>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {editor.mode === EditorMode.Code && (
              <StyledCodeContainer
                initial="hide"
                animate="show"
                exit="hide"
                variants={{
                  hide: {
                    right: '-100%',
                  },
                  show: {
                    right: 0,
                  },
                }}
                transition={{
                  ease: [0.19, 1, 0.22, 1],
                  duration: 0.4,
                }}
              >
                <CodeEditor
                  css={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              </StyledCodeContainer>
            )}
          </AnimatePresence>
        </AnimatePresence>
      </StyledScreen>
    );
  }
);
