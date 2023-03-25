import * as t from '@rekajs/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { PairInput } from '@app/components/pair-input';
import { SettingSection } from '@app/components/settings-section';
import { useEditor } from '@app/editor';

export const GlobalSettings = observer(() => {
  const editor = useEditor();
  const [isAddingNewGlobal, setIsAddingNewGlobal] = React.useState(false);

  return (
    <SettingSection
      collapsedOnInitial={true}
      title="Global Variables"
      onAdd={() => {
        setIsAddingNewGlobal(true);
      }}
    >
      <PairInput
        addingNewField={isAddingNewGlobal}
        onCancelAdding={() => setIsAddingNewGlobal(false)}
        idPlaceholder="Name"
        valuePlaceholder="Initial state value"
        onChange={(id, value) => {
          if (!id) {
            return;
          }

          const existingGlobalStateName =
            editor.reka.state.program.globals.find(
              (global) => global.name === id
            );

          editor.reka.change(() => {
            if (!existingGlobalStateName) {
              editor.reka.state.program.globals.push(
                t.val({
                  name: id,
                  init: value,
                })
              );

              return;
            }

            existingGlobalStateName.init = value;
          });
        }}
        values={editor.reka.state.program.globals.map((global) => ({
          id: global.name,
          value: global.init,
        }))}
      />
    </SettingSection>
  );
});
