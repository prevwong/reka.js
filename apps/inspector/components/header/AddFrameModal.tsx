import { useEditor } from '@app/editor';
import { UserFrameExtension } from '@app/extensions/UserFrameExtension';
import { styled } from '@app/styles';

import * as React from 'react';
import { Box } from '../box';
import { Button } from '../button';
import { Modal } from '../modal';
import { Select } from '../select';
import { Text } from '../text';
import { TextField } from '../text-field';

type AddFrameModalProps = {
  isOpen?: boolean;
  onClose: () => void;
};

const InputItem = styled(Box, {
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: '80px 1fr',
  width: '100%',
});

export const AddFrameModal = (props: AddFrameModalProps) => {
  const [frameName, setFrameName] = React.useState('');

  const [componentName, setComponentName] = React.useState('');
  const editor = useEditor();

  return (
    <Modal
      title="Create new Frame"
      isOpen={props.isOpen}
      onClose={() => props.onClose()}
    >
      <Box
        css={{
          display: 'flex',
          mt: '$5',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <InputItem>
          <Text size="1">Name</Text>
          <TextField
            placeholder="Frame #1"
            value={frameName}
            onChange={(e) => {
              setFrameName(e.target.value);
            }}
          />
        </InputItem>
        <InputItem>
          <Text size="1">Component</Text>
          <Box>
            <Select
              value={componentName}
              onChange={(value) => {
                setComponentName(value);
              }}
              items={editor.state.allComponents.map((component) => ({
                value: component.name,
                title: component.name,
              }))}
            />
          </Box>
        </InputItem>
        <Button
          variant="primary"
          css={{
            mt: '$3',
            justifyContent: 'center',
            fontSize: '$2',
            padding: '$2 $4',
          }}
          onClick={() => {
            editor.state.change(() => {
              editor.state.getExtensionState(UserFrameExtension).frames.push({
                id: frameName,
                name: componentName,
              });
            });

            props.onClose();
          }}
        >
          Create Frame
        </Button>
      </Box>
    </Modal>
  );
};
