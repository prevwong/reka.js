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
  const editor = React.useMemo(() => new Editor(...opts), [opts]);

  return (
    <EditorContext.Provider value={editor}>{children}</EditorContext.Provider>
  );
};
