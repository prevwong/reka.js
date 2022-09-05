import * as t from '@composite/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { Button } from '@app/components/button';

import { AddNewPropField } from './AddPropField';
import { EditPropField } from './EditPropField';
import { SettingSection } from './shared';

type PropEditorSectionProps = {
  template: t.Template;
};

export const PropEditorSection = observer(
  ({ template }: PropEditorSectionProps) => {
    const [addNewProp, setAddNewProp] = React.useState(false);
    return (
      <SettingSection>
        <h4>Props</h4>
        {Object.keys(template.props).length === 0 && (
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
          />
        )}
        <Button
          variant="dark"
          css={{ width: 'auto', alignSelf: 'flex-end', mt: '$2' }}
          onClick={() => {
            setAddNewProp(!addNewProp);
          }}
        >
          {addNewProp ? 'Cancel' : 'Add Prop'}
        </Button>
      </SettingSection>
    );
  }
);
