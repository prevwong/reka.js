import * as React from 'react';

import { useEditor, useEditorActiveComponent } from '@app/editor';
import { UserFrame } from '@app/extensions/UserFrameExtension';

import { Box } from '../box';
import { Text } from '../text';
import { TextField } from '../text-field';

type EditPreviewSizeProps = {
  frames: UserFrame[];
};

export const EditPreviewSize = (props: EditPreviewSizeProps) => {
  const editor = useEditor();
  const componentEditor = useEditorActiveComponent();

  return (
    <React.Fragment>
      <Text size={1} css={{ mr: '$3', color: '$grayA11' }}>
        Preview size
      </Text>
      <Box css={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          placeholder="100%"
          size={5}
          value={componentEditor.activeFrame?.user.width ?? 'auto'}
          onCommit={(value) => {
            editor.reka.change(() => {
              const frame = props.frames.find(
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
            editor.reka.change(() => {
              const frame = props.frames.find(
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
    </React.Fragment>
  );
};
