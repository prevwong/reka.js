import * as React from 'react';

import { Editor } from './Editor';

export const EditorContext = React.createContext<Editor>(null as any);

type EditorContextProviderProps = {
  children?: React.ReactNode;
  opts: ConstructorParameters<typeof Editor>;
};

export const EditorContextProvider = ({
  children,
  opts,
}: EditorContextProviderProps) => {
  const [editor, setEditor] = React.useState<Editor | null>(null);

  React.useEffect(() => {
    const editor = new Editor(...opts);

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
    <EditorContext.Provider value={editor}>{children}</EditorContext.Provider>
  );
};
