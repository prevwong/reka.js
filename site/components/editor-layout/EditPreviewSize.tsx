import { Cross1Icon } from '@radix-ui/react-icons';
import * as React from 'react';

import { useEditor, useEditorActiveComponent } from '@app/editor';
import { UserFrame } from '@app/extensions/UserFrameExtension';

import { TextField } from '../text-field';

type EditPreviewSizeProps = {
  frames: UserFrame[];
};

export const EditPreviewSize = (props: EditPreviewSizeProps) => {
  const editor = useEditor();
  const componentEditor = useEditorActiveComponent();

  return (
    <React.Fragment>
      <span className="text-xs mr-3 text-neutral-500">Preview size</span>
      <div className="flex items-center">
        <TextField
          placeholder="100%"
          size={3}
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
        <Cross1Icon className="w-2.5 h-2.5 mx-2 text-gray-500" />
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
      </div>
    </React.Fragment>
  );
};
