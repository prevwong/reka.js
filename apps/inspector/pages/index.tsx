import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { State } from '@composite/state';
import * as t from '@composite/types';
import { Stringifier } from '@composite/parser';

import { EditorContextProvider } from '@app/editor';
import { program } from '@app/constants';

import { setupExperimentalCollaborationSync } from '../utils/setupCollabSync';
import { UserFrameExtension } from '../extensions/UserFrameExtension';
import { EditorLayout } from '../components/editor-layout';

// (window as any).t = t;

if (typeof window !== 'undefined') {
  (window as any).stringifier = new Stringifier();
}

const MyHeader = () => {
  return (
    <div>
      <h2>My React Headers</h2>
    </div>
  );
};

const state = new State({
  data: program,
  components: [
    t.externalComponent({
      name: 'Header',
      render: () => {
        return <MyHeader />;
      },
    }),
  ],
  globals: {
    myString: 'Hello from External Variable',
  },
  extensions: [UserFrameExtension],
});

const [_, provider] = setupExperimentalCollaborationSync(state);

if (typeof window !== 'undefined') {
  (window as any).state = state;
}

const App = observer(() => {
  return (
    <EditorContextProvider opts={[state, provider]}>
      <EditorLayout />
    </EditorContextProvider>
  );
});

export default App;
