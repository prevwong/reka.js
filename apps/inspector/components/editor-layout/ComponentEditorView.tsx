import { useEditor } from '@app/editor';
import { UserFrameExtension } from '@app/extensions/UserFrameExtension';
import { styled } from '@app/styles';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { Box } from '../box';
import { Button } from '../button';
import { RenderFrame } from '../frame/RenderFrame';
import { Select } from '../select';
import { Text } from '../text';
import { EnterTextField } from '../text-field';
import { Tree } from '../tree';
import { AnimatePresence, motion } from 'framer-motion';
import { AddFrameModal } from './AddFrameModal';

const StyledViewContainer = styled(motion.div, {
  position: 'absolute',
  background: 'rgba(255,255,255,0.9)',
  bottom: '10px',
  right: '$4',
  width: '40%',
  height: '80%',
  px: '$4',
  py: '$4',
  backdropFilter: 'blur(10px)',
  borderRadius: '$2',
  overflow: 'scroll',
  boxShadow: 'rgb(0 0 0 / 9%) 0px 3px 12px',
  zIndex: '$4',
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

export const ComponentEditorView = observer(() => {
  const editor = useEditor();

  const [showViewTree, setShowViewTree] = React.useState(false);
  const [showAddFrameModal, setShowAddFrameModal] = React.useState(false);
  const [isEditingFrame, setIsEditingFrame] = React.useState(false);

  const componentEditor = editor.activeComponentEditor;

  console.log(66, isEditingFrame, componentEditor);

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
    <Box css={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        css={{
          display: 'flex',
          px: '$4',
          py: '$4',
          borderBottom: '1px solid $grayA5',
          width: '100%',
          alignItems: 'center',
          position: 'relative',
          zIndex: '$1',
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
          <Select
            placeholder="Select a frame"
            value={componentEditor.activeFrame?.state.id}
            onChange={(value) => {
              componentEditor.setActiveFrame(value);
            }}
            items={componentEditor.frameOptions.map((frame) => ({
              value: frame.id,
              title: frame.id,
            }))}
          />
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
                editor.state.change(() => {
                  const frame = editor.state
                    .getExtensionState(UserFrameExtension)
                    .frames.find(
                      (frame) =>
                        componentEditor.activeFrame?.user.id === frame.id
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
                editor.state.change(() => {
                  const frame = editor.state
                    .getExtensionState(UserFrameExtension)
                    .frames.find(
                      (frame) =>
                        componentEditor.activeFrame?.user.id === frame.id
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
      <Box css={{ position: 'relative', flex: 1, height: '100%' }}>
        {!componentEditor.activeFrame ? (
          <NoFrameSelectedMessage />
        ) : (
          <React.Fragment>
            <RenderFrame
              frame={componentEditor.activeFrame.state}
              width={componentEditor.activeFrame.user.width}
              height={componentEditor.activeFrame.user.height}
            />
            <AnimatePresence>
              {componentEditor.activeFrame.state.root && showViewTree && (
                <StyledViewContainer
                  initial="enter"
                  animate="show"
                  exit="exit"
                  variants={{
                    enter: {
                      opacity: 0,
                      bottom: 0,
                    },
                    show: {
                      opacity: 1,
                      bottom: 10,
                    },
                    exit: {
                      opacity: 0,
                      bottom: 0,
                    },
                  }}
                  transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                >
                  <Tree root={componentEditor.activeFrame.state.root} />
                </StyledViewContainer>
              )}
            </AnimatePresence>
          </React.Fragment>
        )}
      </Box>
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
            Inspect View
          </Button>
        </Box>
      </Box>
      <AddFrameModal
        component={componentEditor.component}
        isOpen={showAddFrameModal}
        key={isEditingFrame ? componentEditor.activeFrame?.user.id : undefined}
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
