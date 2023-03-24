import { Parser } from '@rekajs/parser';
import { RekaProvider } from '@rekajs/react';
import { useRouter } from 'next/router';
import * as React from 'react';

import { HeaderToolbar } from '@app/components/header/HeaderToolbar';
import { SEO } from '@app/components/seo';
import { ToolbarApp } from '@app/components/toolbar-app';
import { EditorContext } from '@app/editor';
import { Editor } from '@app/editor/Editor';

import { EditorLayout } from '../components/editor-layout';

if (typeof window !== 'undefined') {
  (window as any).parser = new Parser();
}

const AppEditor = () => {
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
    <RekaProvider key={editor.reka.id} state={editor.reka}>
      <HeaderToolbar>
        <ToolbarApp />
      </HeaderToolbar>
      <EditorLayout />
    </RekaProvider>
  );
};

const App = () => {
  return (
    <React.Fragment>
      <SEO
        title="Build powerful no-code editors"
        description="The state management system to power your next no-code editor"
      />
      <AppEditor />
    </React.Fragment>
  );
};

App.pageOptions = {
  hideHeaderOnInitial: true,
  footer: false,
};

export default App;
