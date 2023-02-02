import { AnimatePresence, motion } from 'framer-motion';
import { autorun } from 'mobx';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { Editor, EditorMode } from '@app/editor/Editor';
import { styled } from '@app/styles';

import { ComponentEditorView } from './ComponentEditorView';
import { ComponentList } from './ComponentList';
import { GlobalSettings } from './GlobalSettings';
import { ComponentSettings } from './component-settings';
import { TemplateSettings } from './template-settings';

import { AnimatedScreenSlider } from '../animated-screen-slider/AnimatedScreenSlider';
import { Box } from '../box';
import { CodeEditor } from '../code-editor';

const StyledScreen = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  overflow: 'hidden',
  background: '#fff',
  height: '100%',
  position: 'relative',
  flex: 1,
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
  background: 'rgba(255,255,255,0.8)',
  backdropFilter: 'blur(10px)',
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

const getNoneFrameWidth = (editor: Editor) => {
  if (editor.mode === EditorMode.Code) {
    return RIGHT_SIDEBAR_CODE_WIDTH;
  }

  const leftSidebarWidth = editor.compactSidebar ? 0 : LEFT_SIDEBAR_WIDTH;
  return leftSidebarWidth + RIGHT_SIDEBAR_UI_WIDTH;
};

export const EditorLayout = observer(
  (props: React.ComponentProps<typeof StyledScreen>) => {
    const editor = useEditor();

    const leftSidebarDomRef = React.useRef<HTMLDivElement | null>(null);
    const leftSidebarAnimate =
      (editor.mode === EditorMode.UI && !editor.compactSidebar) ||
      editor.compactSidebarVisible
        ? 'show'
        : 'hide';

    React.useEffect(() => {
      const { current: dom } = leftSidebarDomRef;

      if (!document.body || !dom) {
        return;
      }

      const onClickOutside = (e: MouseEvent) => {
        const target = e.target;

        if (!target || !(target instanceof HTMLElement)) {
          return;
        }

        if (dom.contains(target)) {
          return;
        }

        editor.showCompactSidebar(false);
      };

      document.body.addEventListener('click', onClickOutside);

      return () => {
        document.body.removeEventListener('click', onClickOutside);
      };
    }, [editor]);

    return (
      <StyledScreen {...props}>
        <StyledLeftSidebarContainer
          initial="hide"
          animate={[
            leftSidebarAnimate,
            ...(editor.compactSidebar || editor.mode === EditorMode.Code
              ? ['compact']
              : []),
          ]}
          ref={leftSidebarDomRef}
          variants={{
            compact: {
              position: 'absolute',
              zIndex: '9999',
            },
            hide: {
              marginLeft: 0 - LEFT_SIDEBAR_WIDTH,
            },
            show: {
              marginLeft: 0,
            },
          }}
          transition={{
            duration: 0.4,
            ease: [0.04, 0.62, 0.23, 0.98],
            delay: 0.2,
          }}
        >
          <Box css={{ position: 'relative', minWidth: LEFT_SIDEBAR_WIDTH }}>
            <GlobalSettings />
            <Box css={{ position: 'relative', flex: 1 }}>
              <AnimatedScreenSlider
                goBackText="Components"
                active={'component-list'}
                onSetup={(getPath, goTo) => {
                  return autorun(() => {
                    const selectedTpl =
                      editor.activeComponentEditor?.tplEvent.selected;

                    const path = getPath();

                    if (path !== 'component-list') {
                      return;
                    }

                    if (!selectedTpl) {
                      return;
                    }

                    goTo('component-editor');
                  });
                }}
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
          </Box>
        </StyledLeftSidebarContainer>
        <StyledFrameView
          style={{
            width: `calc(100vw - ${getNoneFrameWidth(editor)}px)`,
          }}
        >
          <ComponentEditorView />
        </StyledFrameView>
        <StyledRightSidebarContainer
          initial={false}
          animate={editor.mode}
          variants={{
            ui: { width: RIGHT_SIDEBAR_UI_WIDTH },
            code: { width: RIGHT_SIDEBAR_CODE_WIDTH },
            preview: { width: 0 },
          }}
          transition={{
            duration: 0.4,
            ease: [0.04, 0.62, 0.23, 0.98],
            delay: 0.2,
          }}
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
                transition={{
                  duration: 0.4,
                  ease: [0.04, 0.62, 0.23, 0.98],
                  delay: 0.2,
                }}
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
                transition={{
                  duration: 0.4,
                  ease: [0.04, 0.62, 0.23, 0.98],
                  delay: 0.2,
                }}
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
