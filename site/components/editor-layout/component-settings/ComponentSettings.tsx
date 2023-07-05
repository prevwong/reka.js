import * as t from '@rekajs/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { PairInput } from '@app/components/pair-input';
import { SettingSection } from '@app/components/settings-section';
import { useEditor } from '@app/editor';

import { TemplateLayers } from './TemplateLayers';

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
    <div className="flex flex-col">
      <div className="px-5 py-2 flex items-center [&>input]:px-2 [&>input]:py-3 text-md [&>input]:hover:bg-gray-500">
        <h1 className="flex-1 text-lg mb-2">{component.name}</h1>
      </div>
      <SettingSection
        title="Props"
        info="Input props that this component exposes"
        onAdd={() => setIsAddingNewProp(true)}
        collapsedOnInitial={false}
      >
        <PairInput
          getVariablesForExpr={(i) =>
            editor.reka.getVariablesAtNode(
              component.props[i !== undefined ? i : component.props.length],
              {
                before: {
                  index: i ?? 0,
                },
                filter: ({ variable }) =>
                  t.is(variable, t.Val) || t.is(variable, t.ComponentProp),
              }
            )
          }
          values={component.props.map((prop) => ({
            id: prop.name,
            value: prop.init,
          }))}
          emptyValuesText={'No props set'}
          idPlaceholder="Name"
          valuePlaceholder="No default prop value"
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
        info="Stateful variables which can be referenced anywhere within the component"
        onAdd={() => setIsAddingNewState(true)}
        collapsedOnInitial={false}
      >
        <PairInput
          getVariablesForExpr={(i) =>
            editor.reka.getVariablesAtNode(
              component.state[i !== undefined ? i : component.state.length],
              {
                before: {
                  index: i ?? 0,
                },
                filter: ({ variable }) => t.is(variable, t.Val),
              }
            )
          }
          values={component.state.map((state) => {
            return {
              id: state.name,
              value: state.init,
            };
          })}
          idPlaceholder="Name"
          valuePlaceholder="Initial value"
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
      <div className="relative flex-1">
        <SettingSection title="Template" collapsedOnInitial={false}>
          <TemplateLayers componentId={component.id} />
        </SettingSection>
      </div>
    </div>
  );
});
