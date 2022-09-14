import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { Box } from '../box';
import { ComponentSettings } from './ComponentSettings';

import { ComponentList } from './ProgramSettings/ComponentList';
import { GlobalSettings } from './ProgramSettings/GlobalSettings';
import { SettingsScreen } from './SettingsScreen';

export const SettingsEditor = observer(() => {
  return (
    <Box
      css={{
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <GlobalSettings />
      <Box css={{ position: 'relative', flex: 1 }}>
        <SettingsScreen>
          <ComponentList />
        </SettingsScreen>
        <SettingsScreen
          route="component"
          goBackText="Components"
          goBackToPageNumber={0}
          includeParent
        >
          <ComponentSettings />
        </SettingsScreen>
      </Box>
    </Box>
  );
});
