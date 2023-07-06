import * as t from '@rekajs/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { PairInput } from '@app/components/pair-input';
import { SettingSection } from '@app/components/settings-section';
import { useEditor } from '@app/editor';

type PropEditorSectionProps = {
  template: t.Template;
};

export const PropTemplateSettings = observer(
  ({ template }: PropEditorSectionProps) => {
    const [addNewProp, setAddNewProp] = React.useState(false);
    const [addNewClassListItem, setAddNewClassListItem] = React.useState(false);
    const editor = useEditor();

    const classList = template.classList;

    const variables = editor.reka.getVariablesAtNode(template, {
      filter: (variable) => !t.is(variable, t.RekaComponent),
    });

    return (
      <React.Fragment>
        <SettingSection
          title={'Class List'}
          info={'Add CSS classes conditionally'}
          onAdd={() => setAddNewClassListItem(true)}
          collapsedOnInitial={false}
        >
          <PairInput
            addingNewField={addNewClassListItem}
            onCancelAdding={() => setAddNewClassListItem(false)}
            getVariablesForExpr={() => variables}
            values={
              classList
                ? Object.keys(classList.properties).map((key) => ({
                    id: key,
                    value: classList.properties[key],
                  }))
                : []
            }
            onRemove={(id) => {
              editor.reka.change(() => {
                delete template.classList?.properties[id];
              });
            }}
            onChange={(id, value) => {
              editor.reka.change(() => {
                if (!template.classList) {
                  template.classList = t.objectExpression({
                    properties: {},
                  });
                }

                template.classList.properties[id] = value;
              });
            }}
            idPlaceholder="CSS class"
            valuePlaceholder="Condition"
          ></PairInput>
        </SettingSection>
        <SettingSection
          onAdd={() => setAddNewProp(true)}
          title={'Props'}
          collapsedOnInitial={false}
        >
          <PairInput
            addingNewField={addNewProp}
            onCancelAdding={() => setAddNewProp(false)}
            emptyValuesText={'No props set for this template'}
            onChange={(id, value) => {
              editor.reka.change(() => {
                template.props[id] = value;
              });
            }}
            onRemove={(id) => {
              editor.reka.change(() => {
                delete template.props[id];
              });
            }}
            getVariablesForExpr={() =>
              editor.reka.getVariablesAtNode(template, {
                filter: ({ variable }) => !t.is(variable, t.Component),
              })
            }
            values={Object.keys(template.props).map((prop) => {
              return {
                id: prop,
                value: template.props[prop],
              };
            })}
            idPlaceholder="Prop"
            valuePlaceholder="Value"
          />
        </SettingSection>
      </React.Fragment>
    );
  }
);
