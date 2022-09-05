import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { State } from '@composite/state';
import * as t from '@composite/types';

import { EditorContextProvider } from '@app/editor';
import { DebugFrame } from '@app/components/frame';
import { Box } from '@app/components/box';
import { EditorPanel } from '@app/components/editor-panel';
import { styled } from '@app/stitches.config';
import { ViewEditor } from '@app/components/view-editor';
import { program } from '@app/constants';

import { setupExperimentalCollaborationSync } from './utils/setupCollabSync';
import { UserFrameExtension } from './extensions/UserFrameExtension';

(window as any).t = t;

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

(window as any).state = state;

const StyledScreen = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  overflow: 'hidden',
});

const App = observer(() => {
  return (
    <EditorContextProvider opts={[state, provider]}>
      <StyledScreen>
        <Box
          css={{
            display: 'flex',
            flex: 1,
            height: '100%',
          }}
        >
          <Box css={{ flex: 1, height: '100%', px: '$3', py: '$3' }}>
            <EditorPanel />
          </Box>

          <Box
            css={{
              flex: 1,
              mx: '$3',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              css={{
                flex: 1,
                overflow: 'scroll',
                height: '100%',
                pt: '$3',
                px: '$1',
              }}
            >
              {state
                .getExtensionState(UserFrameExtension)
                .frames.map((frame, i) => (
                  <DebugFrame key={i} frame={frame} />
                ))}
            </Box>

            <ViewEditor />
          </Box>
        </Box>
      </StyledScreen>
    </EditorContextProvider>
  );
});

export default App;
