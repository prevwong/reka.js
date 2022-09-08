import * as t from '@composite/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { Button, IconButton } from '@app/components/button';

import { AddNewPropField } from './AddPropField';
import { EditPropField } from './EditPropField';

import { SettingSection } from '../../SettingSection';

import { PlusIcon } from '@radix-ui/react-icons';
import { styled } from '@app/styles';
import { PropSettingField } from './PropSettingField';

type PropEditorSectionProps = {
  template: t.Template;
};

const StyledSettingSection = styled(SettingSection, {});

const StyledPropsList = styled('div', {
  border: '1px solid $grayA5',
  borderRadius: '$1',
  [`& ${PropSettingField}`]: {
    borderBottom: '1px solid $grayA5',
    '&:last-child': {
      borderBottomColor: 'transparent',
    },
  },
});

export const PropEditorSection = observer(
  ({ template }: PropEditorSectionProps) => {
    const [addNewProp, setAddNewProp] = React.useState(false);
    return (
      <StyledSettingSection onAdd={() => setAddNewProp(true)} title={'Props'}>
        {!addNewProp && Object.keys(template.props).length === 0 && (
          <span>There're no props on this template.</span>
        )}
        <StyledPropsList>
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
        </StyledPropsList>
      </StyledSettingSection>
    );
  }
);
