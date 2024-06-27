import * as React from 'react';

import { Button } from '@app/components/button';
import { useEditor, useEditorActiveComponent } from '@app/editor';
import { UserFrame } from '@app/extensions/UserFrameExtension';

type PresetPreviewSizeProps = {
  frames: UserFrame[];
  width: string;
  height: string;
  children?: React.ReactNode;
};

export const PresetPreviewSize = (props: PresetPreviewSizeProps) => {
  const editor = useEditor();
  const componentEditor = useEditorActiveComponent();

  return (
    <Button
      size="xs"
      variant="subtle"
      onClick={() => {
        editor.reka.change(() => {
          const frame = props.frames.find(
            (frame) => componentEditor.activeFrame?.user.id === frame.id
          );

          if (!frame) {
            return;
          }

          if (componentEditor.activeFrame) {
            componentEditor.activeFrame.user.width = props.width;
            componentEditor.activeFrame.user.height = props.height;
          }
          frame.width = props.width;
          frame.height = props.height;
        });
      }}
    >
      {props.children}
    </Button>
  );
};
