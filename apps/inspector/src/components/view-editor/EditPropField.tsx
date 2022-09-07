import { Parser, Stringifier } from '@composite/parser';
import * as t from '@composite/types';
import { Cross2Icon } from '@radix-ui/react-icons';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { TextField } from '@app/components/text-field';
import { EditPropSettingsField } from './shared';
import { IconButton } from '../button';

const stringifier = new Stringifier();
const parser = new Parser();

type EditPropFieldProps = {
  template: t.Template;
  prop: string;
};

export const EditPropField = ({ template, prop }: EditPropFieldProps) => {
  const editor = useEditor();
  const [value, setValue] = React.useState(
    stringifier.toString(template.props[prop])
  );

  return (
    <EditPropSettingsField>
      <TextField type="text" value={prop} onChange={() => {}} />
      <TextField
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') {
            return;
          }

          const newValue = value.trim();

          if (!newValue) {
            return;
          }

          try {
            const parsedValue = parser.parseExpressionFromSource(`{${value}}`);
            editor.state.change(() => {
              template.props[prop] = parsedValue;
            });
          } catch (err) {
            // TODO: error
            console.warn(err);
            // Reset to default
            setValue(stringifier.toString(template.props[prop]));
          }
        }}
      />
      <IconButton
        transparent
        onClick={() => {
          editor.state.change(() => {
            delete template.props[prop];
          });
        }}
      >
        <Cross2Icon />
      </IconButton>
    </EditPropSettingsField>
  );
};
