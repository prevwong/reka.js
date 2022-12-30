import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { UserFrameExtension } from '@app/extensions/UserFrameExtension';
import { styled } from '@app/styles';

import { AddFrameModal } from './AddFrameModal';
import { TemplateComments } from './TemplateComments';

import { Box } from '../box';
import { Button } from '../button';
import { RenderFrame } from '../frame/RenderFrame';
import { Select } from '../select';
import { Text } from '../text';
import { EnterTextField } from '../text-field';
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
      }}
    >
      <Text css={{ color: '$grayA9' }}>No frame selected</Text>
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
      css={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      ref={containerDOMRef}
    >
      <Box
        css={{
          display: 'flex',
          px: '$4',
          py: '$4',
          borderBottom: '1px solid $grayA5',
          width: '100%',
          alignItems: 'center',
          position: 'relative',
          zIndex: '$4',
          background: '#fff',
        }}
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
            <EnterTextField
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
            <EnterTextField
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
      </Box>
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
        <Box
          css={{
            display: 'flex',
            alignItems: 'center',
            borderTop: '1px solid $grayA5',
            px: '$4',
            py: '$3',
            position: 'relative',
            zIndex: '$2',
            background: '#fff',
          }}
        >
          <Box
            css={{
              ml: '-$3',
              display: 'flex',
              alignItems: 'center',
              flex: 1,
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
          </Box>
          <Box
            css={{
              display: 'flex',
              alignItems: 'center',
              alignSelf: 'flex-end',
              justifySelf: 'flex-end',
            }}
          >
            <Button onClick={() => setShowViewTree(!showViewTree)}>
              Toggle View
            </Button>
          </Box>
          {componentEditor.activeFrame.templateToShowComments && (
            <TemplateComments activeFrame={componentEditor.activeFrame} />
          )}
        </Box>
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
