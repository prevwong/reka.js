import * as React from 'react';
import { styled } from '@app/styles';
import { useEditor } from '@app/editor';
import { UserFrameExtension } from '@app/extensions/UserFrameExtension';
import { DebugFrame } from '../frame';
import { SettingsEditor } from '../settings-editor';
import { CodeEditor } from '../code-editor';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { EditorMode } from '@app/editor/Editor';
import { observer } from 'mobx-react-lite';
import { useCollector } from '@composite/react';

import { LeftSettingsEditor } from '../settings-editor/LeftSettingsEditor';
import { Text } from '../text';
import { Box } from '../box';
import { ComponentEditorView } from './ComponentEditorView';
import { GlobalSettings } from '../settings-editor/ProgramSettings/GlobalSettings';
import { AnimatedScreenSlider } from '../animated-screen-slider/AnimatedScreenSlider';
import { ComponentList } from '../settings-editor/ProgramSettings/ComponentList';
import { ComponentSettings } from '../settings-editor/ComponentSettings';
import { TemplateSettings } from '../settings-editor/TemplateSettings';

const StyledScreen = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  overflow: 'hidden',
  background: '#fff',
  position: 'relative',
});

const LEFT_SIDEBAR_WIDTH = 250;
const RIGHT_SIDEBAR_UI_WIDTH = 300;
const RIGHT_SIDEBAR_CODE_WIDTH = 500;

const StyledLeftSidebarContainer = styled(motion.div, {
  overflow: 'auto',
  position: 'relative',
  height: '100%',
  width: `${LEFT_SIDEBAR_WIDTH}px`,
  display: 'flex',
  flexDirection: 'column',
  borderRight: '1px solid $grayA5',
  background: '#fff',
  marginLeft: 0,
});

const StyledRightSidebarContainer = styled(motion.div, {
  width: `${RIGHT_SIDEBAR_UI_WIDTH}px`,
  background: '#fff',
  borderLeft: '1px solid $grayA5',
  position: 'relative',
  height: '100%',
});

const StyledCodeContainer = styled(motion.div, {
  position: 'absolute',
  top: 0,
  right: 0,
  background: '#fff',
  width: '100%',
  height: '100%',
});

const StyledSettingsEditor = styled(motion.div, {
  overflow: 'auto',
  position: 'absolute',
  background: '#fff',
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  top: 0,
  right: 0,
});

const StyledFrameView = styled(motion.div, {
  background: '#fff',
  height: '100%',
  transition: '0.2s ease-in',
  flex: 1,
});

export const EditorLayout = observer(
  (props: React.ComponentProps<typeof StyledScreen>) => {
    const editor = useEditor();

    return (
      <StyledScreen {...props}>
        <StyledLeftSidebarContainer
          initial={'ui'}
          animate={editor.mode}
          variants={{
            code: {
              marginLeft: 0 - LEFT_SIDEBAR_WIDTH,
            },
            ui: {
              marginLeft: 0,
            },
          }}
          transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
        >
          <GlobalSettings />

          <Box css={{ position: 'relative', flex: 1 }}>
            <AnimatedScreenSlider
              active={'component-list'}
              screens={[
                {
                  id: 'component-list',
                  render: (cb) => {
                    return (
                      <ComponentList
                        onComponentSelected={(component) => {
                          editor.setActiveComponentEditor(component);
                          cb.goTo('component-editor');
                        }}
                      />
                    );
                  },
                },
                {
                  id: 'component-editor',
                  render: () => {
                    return <ComponentSettings />;
                  },
                },
              ]}
            />
          </Box>
        </StyledLeftSidebarContainer>
        <StyledFrameView>
          <ComponentEditorView />
        </StyledFrameView>
        <StyledRightSidebarContainer
          initial={false}
          animate={editor.mode}
          variants={{
            ui: { width: RIGHT_SIDEBAR_UI_WIDTH },
            code: { width: RIGHT_SIDEBAR_CODE_WIDTH },
          }}
          transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
        >
          <AnimatePresence initial={false}>
            {editor.mode === EditorMode.Code && (
              <StyledCodeContainer
                initial="enter"
                animate="show"
                exit="hide"
                variants={{
                  enter: {
                    opacity: 0,
                    right: '-100%',
                  },
                  show: {
                    opacity: 1,
                    right: 0,
                  },
                  hide: {
                    opacity: 0,
                    right: '-100%',
                  },
                }}
                transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
              >
                <CodeEditor />
              </StyledCodeContainer>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {editor.mode === EditorMode.UI && (
              <StyledSettingsEditor
                initial="enter"
                animate="show"
                exit="hide"
                variants={{
                  enter: {
                    right: '-100%',
                  },
                  show: {
                    right: 0,
                  },
                  hide: {
                    right: '-100%',
                  },
                }}
                transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
              >
                <TemplateSettings />
              </StyledSettingsEditor>
            )}
          </AnimatePresence>
        </StyledRightSidebarContainer>
      </StyledScreen>
    );
  }
);
