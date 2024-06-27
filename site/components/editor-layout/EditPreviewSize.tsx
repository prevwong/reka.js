import { Cross1Icon, DesktopIcon, MobileIcon } from '@radix-ui/react-icons';
import { TabletIcon } from 'lucide-react';
import * as React from 'react';

import { PresetPreviewSize } from '@app/components/editor-layout/PresetPreviewSize';
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
      <div className="flex flex-row items-center">
        <span className="text-xs mr-3 text-slate-500">Preview size</span>
        <div className="flex items-center pr-2">
          <PresetPreviewSize frames={props.frames} width="390px" height="844px">
            <MobileIcon />
          </PresetPreviewSize>
          <PresetPreviewSize
            frames={props.frames}
            width="820px"
            height="1180px"
          >
            <TabletIcon />
          </PresetPreviewSize>
          <PresetPreviewSize frames={props.frames} width="100%" height="100%">
            <DesktopIcon />
          </PresetPreviewSize>
        </div>
      </div>
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
        <Cross1Icon className="w-2.5 h-2.5 mx-2 text-slate-500" />
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
