import { InfoCircledIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { EditorMode } from '@app/editor/Editor';
import { UserFrameExtension } from '@app/extensions/UserFrameExtension';
import { styled } from '@app/styles';

import { AddFrameModal } from './AddFrameModal';
import { TemplateComments } from './TemplateComments';

import { Box } from '../box';
import { Button } from '../button';
import { RenderFrame } from '../frame/RenderFrame';
import { Select } from '../select';
import { Switch } from '../switch';
import { Text } from '../text';
import { TextField } from '../text-field';
import { Tooltip } from '../tooltip';
import { Tree } from '../tree';

const StyledFrameContainer = styled('div', {
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '$grayA5',
  '> iframe': {
    display: 'block',
    margin: '0 auto',
    width: '100%',
    height: '100%',
    boxShadow: 'none',
    border: '1px solid transparent',
    borderRadius: 0,
    background: '#fff',
  },
  variants: {
    isNotFullWidth: {
      true: {
        padding: '$4',
        '> iframe': {
          borderColor: 'rgb(0 0 0 / 7%)',
          borderRadius: '$1',
        },
      },
    },
  },
});

const TOOLBAR_HEIGHT = 56;

const Toolbar = styled(motion.div, {
  display: 'flex',
  px: '$4',
  py: '$4',
  borderBottom: '1px solid $grayA5',
  width: '100%',
  height: `${TOOLBAR_HEIGHT}px`,
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

const isNotFullWidth = (
  width: number | string | undefined,
  height: number | string | undefined
) => {
  const isFullWidth = width === '100%' && height === '100%';
  const isUnset = !width && !height;

  const isNotFullWidth = !isFullWidth && !isUnset;

  return isNotFullWidth;
};

export const ComponentEditorView = observer(() => {
  const editor = useEditor();

  const [showViewTree, setShowViewTree] = React.useState(false);
  const [showAddFrameModal, setShowAddFrameModal] = React.useState(false);
  const [isEditingFrame, setIsEditingFrame] = React.useState(false);

  const componentEditor = editor.activeComponentEditor;

  const containerDOMRef = React.useRef<HTMLDivElement | null>(null);
  const frameContainerDOMRef = React.useRef<HTMLDivElement | null>(null);

  const frames = componentEditor
    ? editor.composite
        .getExtension(UserFrameExtension)
        .state.frames.filter(
          (frame) => frame.name === componentEditor.component.name
        )
    : [];

  const [frameScale, setFrameScale] = React.useState(1);

  const computeFrameScale = React.useCallback(() => {
    if (!showViewTree) {
      setFrameScale(1);
      return;
    }

    const { current: containerDOM } = containerDOMRef;

    if (!containerDOM) {
      return;
    }

    // const width = containerDOM.getBoundingClientRect().width;
    // TODO: scale
    // setFrameScale((width - 400) / width);
  }, [showViewTree]);

  React.useEffect(() => {
    computeFrameScale();
  }, [computeFrameScale]);

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
        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
      >
        <Box
          css={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
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
            css={{ ml: '$2' }}
            transparent
            variant="primary"
            onClick={() => {
              setShowAddFrameModal(true);
            }}
          >
            Add new Frame
          </Button>
        </Box>
        <Box css={{ display: 'flex', alignItems: 'center' }}>
          <Text size={1} css={{ mr: '$3', color: '$grayA11' }}>
            Preview size
          </Text>
          <Box css={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              placeholder="100%"
              size={5}
              value={componentEditor.activeFrame?.user.width ?? 'auto'}
              onCommit={(value) => {
                editor.composite.change(() => {
                  const frame = frames.find(
                    (frame) => componentEditor.activeFrame?.user.id === frame.id
                  );

                  if (!frame) {
                    return;
                  }

                  frame.width = value;
                });
              }}
            />
            <Text size={1} css={{ mx: '$2', color: '$grayA10' }}>
              x
            </Text>
            <TextField
              placeholder="100%"
              size={5}
              value={componentEditor.activeFrame?.user.height ?? 'auto'}
              onCommit={(value) => {
                editor.composite.change(() => {
                  const frame = frames.find(
                    (frame) => componentEditor.activeFrame?.user.id === frame.id
                  );

                  if (!frame) {
                    return;
                  }

                  frame.height = value;
                });
              }}
            />
          </Box>
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
              isNotFullWidth={isNotFullWidth(
                componentEditor.activeFrame.user.width,
                componentEditor.activeFrame.user.height
              )}
              css={{
                filter: `grayscale(${
                  componentEditor.activeFrame.state.sync ? 0 : 1
                })`,
                transition: '0.2s ease-in',
                '> iframe': {
                  maxWidth: componentEditor.activeFrame.user.width,
                  maxHeight: componentEditor.activeFrame.user.height,
                },
              }}
            >
              <RenderFrame
                frame={componentEditor.activeFrame}
                scale={frameScale}
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
              <Tooltip
                content={
                  componentEditor.activeFrame.state.sync
                    ? "The Frame's View tree will be updated when there's a change made to State"
                    : 'Frame will not recompute its View tree'
                }
              >
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
                    <InfoCircledIcon width={12} height={12} />
                  </Box>
                </Text>
              </Tooltip>
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
            <Button
              transparent
              variant="primary"
              onClick={() => {
                setShowAddFrameModal(true);
                setIsEditingFrame(true);
              }}
            >
              Edit Frame Props
            </Button>
            <Button
              transparent
              variant="danger"
              onClick={() => {
                editor.composite.change(() => {
                  const userFrame = componentEditor.activeFrame?.user;

                  if (!userFrame) {
                    return;
                  }

                  const userFrames =
                    editor.composite.getExtension(UserFrameExtension).state
                      .frames;

                  userFrames.splice(userFrames.indexOf(userFrame), 1);
                });
              }}
            >
              Remove Frame
            </Button>
            <Button onClick={() => setShowViewTree(!showViewTree)}>
              Toggle View
            </Button>
          </Box>
          {componentEditor.activeFrame.templateToShowComments && (
            <TemplateComments activeFrame={componentEditor.activeFrame} />
          )}
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
          setShowAddFrameModal(false);
          setIsEditingFrame(false);
        }}
      />
    </Box>
  );
});
