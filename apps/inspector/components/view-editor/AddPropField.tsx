import { Parser } from '@composite/parser';
import * as t from '@composite/types';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { TextField } from '@app/components/text-field';
import { EditPropSettingsField } from './shared';
import { IconButton } from '../button';
import { Cross1Icon, Cross2Icon } from '@radix-ui/react-icons';

const parser = new Parser();

type AddNewPropFieldProps = {
  template: t.Template;
  onAdd: () => void;
  onCancel: () => void;
};

export const AddNewPropField = ({
  template,
  onAdd,
  onCancel,
}: AddNewPropFieldProps) => {
  const editor = useEditor();
  const [prop, setProp] = React.useState('');
  const [value, setValue] = React.useState('');

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') {
      return;
    }

    const newProp = prop.trim();
    const newValue = value.trim();

    if (!newProp || !newValue) {
      return;
    }

    try {
      const parsedValue = parser.parseExpressionFromSource(`{${newValue}}`);
      //   console.log("parsedValue", parsedValue);
      editor.state.change(() => {
        template.props[newProp] = parsedValue;
      });

      onAdd();
    } catch (err) {
      // TODO: handle error
      console.warn(err);
    }
  };

  return (
    <EditPropSettingsField>
      <TextField
        placeholder="Prop"
        value={prop}
        onChange={(e) => setProp(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <TextField
        placeholder="Value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <IconButton
        transparent
        onClick={() => {
          onCancel();
        }}
      >
        <Cross2Icon />
      </IconButton>
    </EditPropSettingsField>
  );
};
