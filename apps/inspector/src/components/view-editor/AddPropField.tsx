import { Parser } from '@composite/parser';
import * as t from '@composite/types';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { Box } from '@app/components/box';
import { TextField } from '@app/components/text-field';

const parser = new Parser();

type AddNewPropFieldProps = {
  template: t.Template;
  onAdd: () => void;
};

export const AddNewPropField = ({ template, onAdd }: AddNewPropFieldProps) => {
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
    <Box css={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '$2' }}>
      <TextField
        placeholder="Prop"
        value={prop}
        onChange={(e) => setProp(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <TextField
        badge="expression"
        placeholder="Value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </Box>
  );
};
