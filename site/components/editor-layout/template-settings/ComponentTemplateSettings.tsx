import * as t from '@rekajs/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { PropEditorSection } from './shared/PropEditorSection';

type ComponentTemplateSettingsProps = {
  template: t.ComponentTemplate;
};

export const ComponentTemplateSettings = observer(
  ({ template }: ComponentTemplateSettingsProps) => {
    return (
      <div className="grid gap-5">
        <PropEditorSection template={template} />
      </div>
    );
  }
);
