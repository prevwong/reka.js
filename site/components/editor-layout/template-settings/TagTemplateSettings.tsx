import * as t from '@rekajs/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { Box } from '@app/components/box';

import { PropEditorSection } from './shared/PropEditorSection';

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
