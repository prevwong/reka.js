import * as t from '@composite/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { Box } from '@app/components/box';
import { TextField } from '@app/components/text-field';

import { SettingField } from './shared';
import { PropEditorSection } from './PropEditorSection';

type TagTemplateSettingsProps = {
  template: t.TagTemplate;
};

export const TagTemplateSettings = observer(
  ({ template }: TagTemplateSettingsProps) => {
    return (
      <Box css={{ display: 'grid', gap: '10px' }}>
        <PropEditorSection template={template} />
      </Box>
    );
  }
);
