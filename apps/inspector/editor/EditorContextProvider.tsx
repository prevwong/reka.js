import { CompositeProvider } from '@composite/react';
import * as React from 'react';

import { Editor } from './Editor';

export const EditorContext = React.createContext<Editor>(null as any);

type EditorContextProviderProps = {
  children?: React.ReactNode;
};

export const EditorContextProvider = ({
  children,
}: EditorContextProviderProps) => {
  const [editor, setEditor] = React.useState<Editor | null>(null);

  React.useEffect(() => {
    const editor = new Editor();

    (window as any).state = editor.composite;

    setEditor(editor);

    return () => {
      setEditor(null);
      editor.dispose();
    };
  }, []);

  if (!editor) {
    return null;
  }

  return (
    <EditorContext.Provider value={editor}>
      <CompositeProvider state={editor.composite}>{children}</CompositeProvider>
    </EditorContext.Provider>
  );
};
