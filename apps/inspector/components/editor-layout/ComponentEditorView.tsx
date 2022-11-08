import { useEditor } from '@app/editor';
import * as t from '@composite/types';
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

const StyledViewContainer = styled(motion.div, {
  position: 'absolute',
  background: 'rgba(255,255,255,0.9)',
  bottom: '10px',
  left: '$4',
  width: '40%',
  height: '80%',
  px: '$4',
  py: '$4',
  backdropFilter: 'blur(10px)',
  borderRadius: '$2',
  overflow: 'scroll',
  boxShadow: 'rgb(0 0 0 / 9%) 0px 3px 12px',
});

const NoFrameSelectedMessage = () => {
  return (
    <Box
      css={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <Text>No frame selected</Text>
    </Box>
  );
};

export const ComponentEditorView = observer(() => {
  const editor = useEditor();

  const [showViewTree, setShowViewTree] = React.useState(false);

  if (!editor.settings.active) {
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
        }}
      >
        <Box css={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Text css={{ mr: '$4' }}>
            {editor.settings.active.component.name}
          </Text>
          <Select
            placeholder="Select a frame"
            value={editor.settings.active.frame?.state.id}
            onChange={() => {}}
            items={editor.settings.active.availableUserFrames.map((frame) => ({
              value: frame.id,
              title: frame.id,
            }))}
          />
        </Box>
        <Box css={{ display: 'flex', alignItems: 'center' }}>
          <Text size={1} css={{ mr: '$3', color: '$grayA11' }}>
            Preview size
          </Text>
          <Box css={{ display: 'flex', alignItems: 'center' }}>
            <EnterTextField
              placeholder="100%"
              size={5}
              value={editor.settings.active.frame?.userData.width}
              onCommit={(value) => {
                editor.state.change(() => {
                  const frame = editor.state
                    .getExtensionState(UserFrameExtension)
                    .frames.find(
                      (frame) =>
                        editor.settings.active?.frame?.userData.id === frame.id
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
              value={editor.settings.active.frame?.userData.height}
              onCommit={(value) => {
                editor.state.change(() => {
                  const frame = editor.state
                    .getExtensionState(UserFrameExtension)
                    .frames.find(
                      (frame) =>
                        editor.settings.active?.frame?.userData.id === frame.id
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
        {!editor.settings.active.frame ? (
          <NoFrameSelectedMessage />
        ) : (
          <React.Fragment>
            <RenderFrame
              frame={editor.settings.active.frame.state}
              width={editor.settings.active.frame.userData.width}
              height={editor.settings.active.frame.userData.height}
            />
            <AnimatePresence>
              {editor.settings.active.frame.state.root && showViewTree && (
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
                  transition={{
                    x: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                >
                  <Tree root={editor.settings.active.frame.state.root} />
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
        }}
      >
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
    </Box>
  );
});
