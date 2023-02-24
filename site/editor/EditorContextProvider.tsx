import * as React from 'react';

import { Editor } from './Editor';

export const EditorContext = React.createContext<{
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
}>(null as any);

type EditorContextProviderProps = {
  children?: React.ReactNode;
};

export const EditorContextProvider = ({
  children,
}: EditorContextProviderProps) => {
  const [editor, setEditor] = React.useState<Editor | null>(null);

  return (
    <EditorContext.Provider value={{ editor, setEditor }}>
      {children}
    </EditorContext.Provider>
  );
};
