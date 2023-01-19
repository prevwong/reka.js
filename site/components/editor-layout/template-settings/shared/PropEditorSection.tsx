import { Parser } from '@rekajs/parser';
import * as t from '@rekajs/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { PairInput } from '@app/components/pair-input';
import { SettingSection } from '@app/components/settings-section';
import { useEditor } from '@app/editor';

type PropEditorSectionProps = {
  template: t.Template;
};

export const PropEditorSection = observer(
  ({ template }: PropEditorSectionProps) => {
    const [addNewProp, setAddNewProp] = React.useState(false);
    const [addNewClassListItem, setAddNewClassListItem] = React.useState(false);
    const editor = useEditor();

    const classList = template.classList;

    return (
      <React.Fragment>
        <SettingSection
          title={'Class List'}
          onAdd={() => setAddNewClassListItem(true)}
        >
          <PairInput
            addingNewField={addNewClassListItem}
            onCancelAdding={() => setAddNewClassListItem(false)}
            values={
              classList
                ? Object.keys(classList.properties).map((key) => ({
                    id: key,
                    value: Parser.stringify(classList.properties[key]),
                  }))
                : []
            }
            onChange={(id, value) => {
              const parsedValue = Parser.parseExpression(value, t.Expression);
              //   console.log("parsedValue", parsedValue);
              editor.reka.change(() => {
                if (!template.classList) {
                  template.classList = t.objectExpression({
                    properties: {},
                  });
                }

                template.classList.properties[id] = parsedValue;
              });
            }}
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
              const parsedValue = Parser.parseExpression(value, t.Expression);

              editor.reka.change(() => {
                template.props[id] = parsedValue;
              });
            }}
            onRemove={(id) => {
              editor.reka.change(() => {
                delete template.props[id];
              });
            }}
            values={Object.keys(template.props).map((prop) => ({
              id: prop,
              value: Parser.stringify(template.props[prop]),
            }))}
          />
        </SettingSection>
      </React.Fragment>
    );
  }
);
