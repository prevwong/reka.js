import * as React from 'react';

import { State } from '@composite/state';
import * as t from '@composite/types';
import { Stringifier } from '@composite/parser';
import { Composite } from '@composite/react';

import { EditorContextProvider } from '@app/editor';
import { program } from '@app/constants';

import { UserFrameExtension } from '../extensions/UserFrameExtension';
import { EditorLayout } from '../components/editor-layout';
import { Box } from '@app/components/box';
import { Header } from '@app/components/header';
import { UserIcon } from '@app/external/UserIcon';

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
    t.externalComponent({
      name: 'Icon',
      render: (props: { name: string }) => {
        return <UserIcon name={props.name} />;
      },
    }),
  ],
  globals: {
    myString: 'Hello from External Variable',
    posts: [
      {
        name: "I'm now a monk",
        description: 'Life changing quote goes here',
      },
      {
        name: 'Hello World',
        description: 'Inspirational quote goes here',
      },
    ],
  },
  extensions: [UserFrameExtension],
});

if (typeof window !== 'undefined') {
  (window as any).state = state;
}

const App = () => {
  return (
    <Composite state={state}>
      <EditorContextProvider opts={[state]}>
        <Box
          css={{ display: 'flex', flexDirection: 'column', height: '100vh' }}
        >
          <Header />
          <EditorLayout css={{ flex: 1 }} />
        </Box>
      </EditorContextProvider>
    </Composite>
  );
};

export default App;
