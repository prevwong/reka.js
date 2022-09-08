import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { ProgramSettings } from './ProgramSettings';

export const SettingsEditor = observer(() => {
  return <ProgramSettings />;
});
