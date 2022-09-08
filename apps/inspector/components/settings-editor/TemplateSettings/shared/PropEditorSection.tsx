import * as t from '@composite/types';
import { Stringifier, Parser } from '@composite/parser';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { SettingSection } from '../../SettingSection';

import { PairInput } from '@app/components/pair-input';
import { useEditor } from '@app/editor';

const stringifier = new Stringifier();
const parser = new Parser();

type PropEditorSectionProps = {
  template: t.Template;
};

export const PropEditorSection = observer(
  ({ template }: PropEditorSectionProps) => {
    const [addNewProp, setAddNewProp] = React.useState(false);
    const editor = useEditor();

    return (
      <SettingSection onAdd={() => setAddNewProp(true)} title={'Props'}>
        {!addNewProp && Object.keys(template.props).length === 0 && (
          <span>There're no props on this template.</span>
        )}
        <PairInput
          addingNewField={addNewProp}
          onCancelAdding={() => setAddNewProp(false)}
          onAdd={(id, value, clear) => {
            try {
              const parsedValue = parser.parseExpressionFromSource(
                `{${value}}`
              );
              //   console.log("parsedValue", parsedValue);
              editor.state.change(() => {
                template.props[id] = parsedValue;
              });

              clear();
            } catch (err) {
              // TODO: handle error
              console.warn(err);
            }
          }}
          onChange={(id, value) => {}}
          values={Object.keys(template.props).map((prop) => ({
            id: prop,
            value: stringifier.toString(template.props[prop]),
          }))}
        />
      </SettingSection>
    );
  }
);
