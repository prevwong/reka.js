import * as t from '@composite/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { Button, IconButton } from '@app/components/button';

import { AddNewPropField } from './AddPropField';
import { EditPropField } from './EditPropField';
import { SettingSection } from './shared';
import { PlusIcon } from '@radix-ui/react-icons';

type PropEditorSectionProps = {
  template: t.Template;
};

export const PropEditorSection = observer(
  ({ template }: PropEditorSectionProps) => {
    const [addNewProp, setAddNewProp] = React.useState(false);
    return (
      <SettingSection
        title={{
          name: 'Props',
          after: (
            <IconButton transparent onClick={() => setAddNewProp(true)}>
              <PlusIcon />
            </IconButton>
          ),
        }}
      >
        {!addNewProp && Object.keys(template.props).length === 0 && (
          <span>There're no props on this template.</span>
        )}
        {Object.keys(template.props).map((prop) => (
          <EditPropField key={prop} template={template} prop={prop} />
        ))}
        {addNewProp && (
          <AddNewPropField
            template={template}
            onAdd={() => {
              setAddNewProp(false);
            }}
            onCancel={() => {
              setAddNewProp(false);
            }}
          />
        )}
      </SettingSection>
    );
  }
);
