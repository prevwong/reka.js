import * as t from '@rekajs/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { Box } from '@app/components/box';
import { PairInput } from '@app/components/pair-input';
import { SettingSection } from '@app/components/settings-section';
import { TextField } from '@app/components/text-field';
import { useEditor } from '@app/editor';
import { styled } from '@app/styles';

import { TemplateLayers } from './TemplateLayers';

const ComponentHeader = styled('div', {
  px: '$4',
  py: '$2',
  display: 'flex',
  alignItems: 'center',
  input: {
    padding: '2px 4px',
    marginLeft: '-4px',
    marginRight: '-4px',
    fontSize: '$4',

    '&:hover': {
      background: '$grayA5',
    },
  },
});

export const ComponentSettings = observer(() => {
  const editor = useEditor();
  const [isAddingNewProp, setIsAddingNewProp] = React.useState(false);
  const [isAddingNewState, setIsAddingNewState] = React.useState(false);

  if (!editor.activeComponentEditor) {
    return null;
  }

  const component = editor.activeComponentEditor.component;

  if (!(component instanceof t.RekaComponent)) {
    return null;
  }

  return (
    <Box css={{ display: 'flex', flexDirection: 'column' }}>
      <ComponentHeader>
        <TextField css={{ flex: 1 }} transparent value={component.name} />
      </ComponentHeader>
      <SettingSection
        title="Props"
        onAdd={() => setIsAddingNewProp(true)}
        collapsedOnInitial={false}
      >
        <PairInput
          values={component.props.map((prop) => ({
            id: prop.name,
            value: prop.init,
          }))}
          emptyValuesText={'No props set'}
          valuePlaceholder="No default value"
          addingNewField={isAddingNewProp}
          onCancelAdding={() => setIsAddingNewProp(false)}
          onChange={(id, value, type) => {
            const existingPropWithSameName = component.props.find(
              (prop) => prop.name === id
            );

            if (type === 'update') {
              if (!existingPropWithSameName) {
                return;
              }

              editor.reka.change(() => {
                existingPropWithSameName.init = value;
              });

              return;
            }

            if (existingPropWithSameName) {
              return;
            }

            editor.reka.change(() => {
              component.props.push(
                t.componentProp({
                  name: id,
                  init: value,
                })
              );
            });
          }}
        />
      </SettingSection>
      <SettingSection
        title="State"
        onAdd={() => setIsAddingNewState(true)}
        collapsedOnInitial={false}
      >
        <PairInput
          values={component.state.map((state) => ({
            id: state.name,
            value: state.init,
          }))}
          emptyValuesText="No state values"
          addingNewField={isAddingNewState}
          onCancelAdding={() => setIsAddingNewState(false)}
          onChange={(id, value, type) => {
            const existingStateWithSameName = component.state.find(
              (state) => state.name === id
            );

            if (type === 'update') {
              if (!existingStateWithSameName) {
                return;
              }

              editor.reka.change(() => {
                existingStateWithSameName.init = value;
              });

              return;
            }

            if (existingStateWithSameName) {
              return;
            }

            editor.reka.change(() => {
              component.state.push(
                t.val({
                  name: id,
                  init: value,
                })
              );
            });
          }}
        />
      </SettingSection>
      <Box css={{ position: 'relative', flex: 1 }}>
        <SettingSection title="Template" collapsedOnInitial={false}>
          <TemplateLayers componentId={component.id} />
        </SettingSection>
      </Box>
    </Box>
  );
});
