import {
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeClosedIcon,
  EyeOpenIcon,
} from '@radix-ui/react-icons';
import { Undo, Redo } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { useMaybeEditor } from '@app/editor';
import { EditorMode } from '@app/editor/Editor';

import { Button, IconButton } from '../button';
import { Collaborators } from '../collaborators';
import { Tooltip } from '../tooltip';

export const ToolbarApp = observer(() => {
  const editor = useMaybeEditor();

  const isCodeModeRef = React.useRef(editor && editor.mode === EditorMode.Code);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-2.5 max-sm:hidden">
      <Tooltip content="Undo">
        <IconButton
          disabled={!editor.reka.canUndo()}
          size="xxs"
          variant="subtle"
          className="text-neutral-600 hover:bg-neutral-100"
          onClick={() => {
            editor.reka.undo();
          }}
        >
          <Undo />
        </IconButton>
      </Tooltip>
      <Tooltip content="Redo">
        <IconButton
          disabled={!editor.reka.canRedo()}
          size="xxs"
          variant="subtle"
          className="text-neutral-600 hover:bg-neutral-100"
          onClick={() => {
            editor.reka.redo();
          }}
        >
          <Redo />
        </IconButton>
      </Tooltip>

      <Collaborators />

      <Tooltip content="Toggle code editor">
        <Button
          variant={'secondary'}
          onClick={() => {
            if (editor.mode === EditorMode.Code) {
              editor.setMode(EditorMode.UI);
              isCodeModeRef.current = false;
              return;
            }

            isCodeModeRef.current = true;
            editor.setMode(EditorMode.Code);
          }}
        >
          {editor.mode === EditorMode.Code ? 'Exit Code Editor' : 'Edit Code'}
        </Button>
      </Tooltip>

      <Tooltip content="Preview">
        <IconButton
          size="default"
          variant="outline"
          onClick={() => {
            if (editor.mode === EditorMode.Preview) {
              editor.setMode(
                isCodeModeRef.current ? EditorMode.Code : EditorMode.UI
              );
              return;
            }

            editor.setMode(EditorMode.Preview);
          }}
        >
          {editor.mode === EditorMode.Preview ? (
            <EyeClosedIcon />
          ) : (
            <EyeOpenIcon />
          )}
        </IconButton>
      </Tooltip>
    </div>
  );
});
