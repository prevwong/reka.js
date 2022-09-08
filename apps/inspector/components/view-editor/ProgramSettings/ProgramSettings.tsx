import { Box } from '@app/components/box';
import * as React from 'react';
import { ComponentSettings } from './ComponentSettings';
import { GlobalSettings } from './GlobalSettings';

export const ProgramSettings = () => {
  return (
    <Box>
      <GlobalSettings />
      <ComponentSettings />
    </Box>
  );
};
