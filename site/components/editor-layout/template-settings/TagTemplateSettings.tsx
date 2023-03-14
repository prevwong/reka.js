import * as t from '@rekajs/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { PropEditorSection } from './shared/PropEditorSection';

type TagTemplateSettingsProps = {
  template: t.TagTemplate;
};

export const TagTemplateSettings = observer(
  ({ template }: TagTemplateSettingsProps) => {
    return (
      <div className="grid gap-2.5">
        <PropEditorSection template={template} />
      </div>
    );
  }
);
