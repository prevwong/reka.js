import { Parser, Stringifier } from '@composite/parser';
import * as t from '@composite/types';

import { Box } from '@app/components/box';
import { PairInput } from '@app/components/pair-input';
import { Text } from '@app/components/text';
import { useEditor } from '@app/editor';

import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { SettingSection } from '../SettingSection';

const parser = new Parser();
const stringifier = new Stringifier();

export const GlobalSettings = observer(() => {
  const editor = useEditor();
  const [isAddingNewGlobal, setIsAddingNewGlobal] = React.useState(false);

  return (
    <SettingSection
      collapsedOnInitial={false}
      title="Global Variables"
      onAdd={() => {
        setIsAddingNewGlobal(true);
      }}
    >
      <PairInput
        addingNewField={isAddingNewGlobal}
        onCancelAdding={() => setIsAddingNewGlobal(false)}
        onAdd={(id, value, clear) => {
          const parsedValue = parser.parseExpressionFromSource(`{${value}}`);

          if (!id || !parsedValue) {
            return;
          }

          const existingGlobalStateName =
            editor.state.data.program.globals.find(
              (global) => global.name === id
            );

          if (existingGlobalStateName) {
            return;
          }

          editor.state.change(() => {
            editor.state.data.program.globals.push(
              t.val({
                name: id,
                init: parsedValue,
              })
            );
          });

          clear();
        }}
        values={editor.state.data.program.globals.map((global) => ({
          id: global.name,
          value: stringifier.toString(global.init),
        }))}
      />
    </SettingSection>
  );
});
