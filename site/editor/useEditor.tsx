import { invariant } from '@rekajs/utils';
import * as React from 'react';

import { EditorContext } from './EditorContextProvider';

export const useMaybeEditor = () => {
  const { editor } = React.useContext(EditorContext);

  return editor;
};

export const useEditor = () => {
  const editor = useMaybeEditor();

  invariant(editor, 'Editor not found');

  return editor;
};

export const useEditorActiveComponent = () => {
  const editor = useEditor();
  invariant(editor.activeComponentEditor, 'No active Component Editor');
  return editor.activeComponentEditor;
};
