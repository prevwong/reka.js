import {
  DotsHorizontalIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { useEditor, useEditorActiveComponent } from '@app/editor';
import { EditorMode } from '@app/editor/Editor';
import { UserFrameExtension } from '@app/extensions/UserFrameExtension';
import { styled } from '@app/styles';
import { CREATE_BEZIER_TRANSITION } from '@app/utils';

import { AddFrameModal } from './AddFrameModal';
import { EditPreviewSize } from './EditPreviewSize';

import { Box } from '../box';
import { Button, IconButton } from '../button';
import { Dropdown } from '../dropdown';
import { RenderFrame } from '../frame/RenderFrame';
import { Info } from '../info';
import { MobileFallback } from '../mobile-fallback';
import { Popover } from '../popover';
import { Select } from '../select';
import { Switch } from '../switch';
import { Text } from '../text';
import { Tooltip } from '../tooltip';
import { Tree } from '../tree';

const StyledFrameContainer = styled('div', {
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '$grayA5',
});

const TOOLBAR_HEIGHT = 40;

const Toolbar = styled(motion.div, {
  display: 'flex',
  px: '$4',
  py: '$3',
  borderBottom: '1px solid $grayA5',
  width: '100%',
  height: TOOLBAR_HEIGHT,
  alignItems: 'center',
  position: 'relative',
  zIndex: '$4',
  background: '#fff',
});

const BOTTOM_TOOLBAR_HEIGHT = 40;

const BottomToolbar = styled(motion.div, {
  display: 'flex',
  alignItems: 'center',
  borderTop: '1px solid $grayA5',
  px: '$4',
  py: '$3',
  position: 'relative',
  zIndex: '$2',
  background: '#fff',
  height: `${BOTTOM_TOOLBAR_HEIGHT}px`,
});

const StyledViewContainer = styled('div', {
  position: 'relative',
  background: 'rgba(255,255,255,0.9)',
  width: '350px',
  '> div': {
    px: '$2',
    py: '$4',
    overflow: 'auto',
    width: '100%',
    height: '100%',
  },
});

const NoFrameSelectedMessage = () => {
  return (
    <Box
      css={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      <Text css={{ color: '$grayA9', lineHeight: '1.5rem' }}>
        No frame selected.
        <br />
        Click &quot;Add new Frame&quot; to create one.
      </Text>
    </Box>
  );
};

export const ComponentEditorView = observer(() => {
  const editor = useEditor();

  const [showViewTree, setShowViewTree] = React.useState(false);
  const [showAddFrameModal, setShowAddFrameModal] = React.useState(false);
  const [isEditingFrame, setIsEditingFrame] = React.useState(false);

  const componentEditor = useEditorActiveComponent();

  const containerDOMRef = React.useRef<HTMLDivElement | null>(null);
  const frameContainerDOMRef = React.useRef<HTMLDivElement | null>(null);

  const frames = componentEditor
    ? editor.reka
        .getExtension(UserFrameExtension)
        .state.frames.filter(
          (frame) => frame.name === componentEditor.component.name
        )
    : [];

  const setEditFrame = React.useCallback(
    (bool = true) => {
      setShowAddFrameModal(bool);
      setIsEditingFrame(bool);
    },
    [setShowAddFrameModal, setIsEditingFrame]
  );

  const removeFrame = React.useCallback(() => {
    editor.reka.change(() => {
      const userFrame = componentEditor.activeFrame?.user;

      if (!userFrame) {
        return;
      }

      const userFrames =
        editor.reka.getExtension(UserFrameExtension).state.frames;

      userFrames.splice(userFrames.indexOf(userFrame), 1);
    });
  }, [editor, componentEditor]);

  if (!componentEditor) {
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
        <Text css={{ color: '$grayA9' }}>No component selected</Text>
      </Box>
    );
  }
  return (
    <Box
      css={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
      ref={containerDOMRef}
    >
      <Toolbar
        initial={false}
        animate={editor.mode === EditorMode.Preview ? 'exit' : 'enter'}
        variants={{
          enter: {
            marginTop: 0,
            opacity: 1,
          },
          exit: {
            marginTop: `-${TOOLBAR_HEIGHT}px`,
            opacity: 0,
          },
        }}
        transition={CREATE_BEZIER_TRANSITION()}
      >
        <Box
          css={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {(editor.compactSidebar || editor.mode === EditorMode.Code) && (
            <Tooltip content="Toggle sidebar">
              <IconButton
                className="mr-3"
                variant={'outline'}
                onClick={(e) => {
                  e.stopPropagation();

                  editor.showCompactSidebar(!editor.compactSidebarVisible);
                }}
              >
                <DoubleArrowRightIcon
                  style={{
                    transition: '0.2s ease-in',
                    transform: `rotate(${
                      editor.compactSidebarVisible ? 180 : 0
                    }deg)`,
                  }}
                />
              </IconButton>
            </Tooltip>
          )}

          <Text css={{ mr: '$4' }}>{componentEditor.component.name}</Text>
          {frames.length > 0 && (
            <Select
              placeholder="Select a frame"
              value={componentEditor.activeFrame?.state.id}
              onChange={(value) => {
                componentEditor.setActiveFrame(value);
              }}
              items={frames.map((frame) => ({
                value: frame.id,
                title: frame.id,
              }))}
            />
          )}

          <Button
            size="xs"
            className="ml-2"
            variant="subtle"
            onClick={() => {
              setShowAddFrameModal(true);
            }}
          >
            Add Frame
          </Button>
          <Info info="A Frame is an instance of a Reka Component" />
        </Box>
        <Box css={{ display: 'flex', alignItems: 'center' }}>
          <MobileFallback
            fallback={
              <Popover
                trigger={
                  <IconButton>
                    <DotsHorizontalIcon />
                  </IconButton>
                }
              >
                <Box
                  css={{ display: 'flex', flexDirection: 'column', gap: '$3' }}
                >
                  <EditPreviewSize frames={frames} />
                </Box>
              </Popover>
            }
            render={<EditPreviewSize frames={frames} />}
          />
        </Box>
      </Toolbar>

      <Box
        css={{
          position: 'relative',
          flex: 1,
          height: '100%',
          display: 'flex',
          minHeight: 0,
        }}
      >
        {!componentEditor.activeFrame ? (
          <NoFrameSelectedMessage />
        ) : (
          <React.Fragment>
            <StyledFrameContainer
              ref={frameContainerDOMRef}
              css={{
                filter: `grayscale(${
                  componentEditor.activeFrame.state.sync ? 0 : 1
                })`,
                transition: '0.2s ease-in',
              }}
            >
              <RenderFrame
                width={componentEditor.activeFrame.user.width}
                height={componentEditor.activeFrame.user.height}
                frame={componentEditor.activeFrame}
              />
            </StyledFrameContainer>

            {componentEditor.activeFrame.state.view && showViewTree && (
              <StyledViewContainer>
                <Tree root={componentEditor.activeFrame.state.view} />
              </StyledViewContainer>
            )}
          </React.Fragment>
        )}
      </Box>
      {componentEditor.activeFrame && (
        <BottomToolbar
          initial={false}
          animate={editor.mode === EditorMode.Preview ? 'exit' : 'enter'}
          variants={{
            exit: {
              marginBottom: `-${BOTTOM_TOOLBAR_HEIGHT}px`,
              opacity: 0,
            },
            enter: {
              marginBottom: 0,
              opacity: 1,
            },
          }}
          transition={CREATE_BEZIER_TRANSITION()}
        >
          <Box
            css={{
              display: 'flex',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <Box css={{ display: 'flex', alignItems: 'center', gap: '$3' }}>
              <Switch
                onChange={() => {
                  if (componentEditor.activeFrame?.state.sync) {
                    componentEditor.activeFrame?.state.disableSync();
                    return;
                  }

                  componentEditor.activeFrame?.state.enableSync();
                }}
                checked={componentEditor.activeFrame.state.sync}
              />

              <Text
                size={1}
                css={{
                  display: 'flex',
                  gap: '$2',
                  fontSize: '10px',
                  color: '$slate10',
                  alignItems: 'center',
                }}
              >
                {componentEditor.activeFrame?.state.sync
                  ? 'Synching'
                  : 'Not synching'}
                <Box>
                  <Info
                    info={
                      componentEditor.activeFrame.state.sync
                        ? "The Frame's View tree will be updated when there's a change made to State"
                        : 'Frame will not recompute its View tree'
                    }
                  />
                </Box>
              </Text>
            </Box>
          </Box>
          <Box
            css={{
              display: 'flex',
              alignItems: 'center',
              alignSelf: 'flex-end',
              justifySelf: 'flex-end',
              gap: '$2',
            }}
          >
            <MobileFallback
              size={1200}
              fallback={
                <Dropdown
                  items={[
                    {
                      title: 'Edit frame props',
                      onSelect: () => {
                        setEditFrame(true);
                      },
                    },
                    {
                      title: 'Remove frame',
                      onSelect: () => {
                        removeFrame();
                      },
                    },
                    {
                      title: 'Toggle View',
                      onSelect: () => {
                        setShowViewTree(!showViewTree);
                      },
                    },
                  ]}
                >
                  <IconButton>
                    <DotsHorizontalIcon />
                  </IconButton>
                </Dropdown>
              }
              render={
                <React.Fragment>
                  <Button
                    size="xs"
                    onClick={() => {
                      setEditFrame(true);
                    }}
                  >
                    Edit Frame Props
                  </Button>
                  <Button
                    size="xs"
                    onClick={() => {
                      removeFrame();
                    }}
                  >
                    Remove Frame
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setShowViewTree(!showViewTree)}
                  >
                    Toggle View
                  </Button>
                </React.Fragment>
              }
            />
          </Box>
        </BottomToolbar>
      )}

      <AddFrameModal
        key={`${componentEditor.component.id}${
          isEditingFrame ? `-${componentEditor.activeFrame?.user.id}` : ''
        }`}
        component={componentEditor.component}
        isOpen={showAddFrameModal}
        frameId={
          isEditingFrame ? componentEditor.activeFrame?.user.id : undefined
        }
        onClose={() => {
          setEditFrame(false);
        }}
      />
    </Box>
  );
});
