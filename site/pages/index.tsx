import { Parser } from '@rekajs/parser';
import { RekaProvider } from '@rekajs/react';
import { useRouter } from 'next/router';
import * as React from 'react';

import { HeaderToolbar } from '@app/components/header/HeaderToolbar';
import { ToolbarApp } from '@app/components/toolbar-app';
import { EditorContext } from '@app/editor';
import { Editor } from '@app/editor/Editor';

import { EditorLayout } from '../components/editor-layout';

if (typeof window !== 'undefined') {
  (window as any).parser = new Parser();
}

const App = () => {
  const router = useRouter();

  const { editor, setEditor } = React.useContext(EditorContext);

  const routerRef = React.useRef(router);
  routerRef.current = router;

  React.useEffect(() => {
    const editor = new Editor(routerRef.current);

    (window as any).state = editor.reka;

    setEditor(editor);

    return () => {
      setEditor(null);
      editor.dispose();
    };
  }, [setEditor]);

  if (!editor) {
    return null;
  }

  return (
    <RekaProvider state={editor.reka}>
      <HeaderToolbar>
        <ToolbarApp />
      </HeaderToolbar>
      <EditorLayout />
    </RekaProvider>
  );
};

App.pageOptions = {
  hideHeaderOnInitial: true,
  footer: false,
};

export default App;
