import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { Box } from '../box';

import { TemplateSettings } from './TemplateSettings';

export const SettingsEditor = observer(() => {
  return (
    <Box
      css={{
        overflow: 'auto',
        position: 'relative',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <TemplateSettings />
    </Box>
  );
});
