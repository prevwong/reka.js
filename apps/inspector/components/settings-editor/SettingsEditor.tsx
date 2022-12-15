import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { TemplateSettings } from './TemplateSettings';

import { Box } from '../box';

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
