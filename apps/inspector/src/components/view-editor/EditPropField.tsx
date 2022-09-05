import { Parser, Stringifier } from '@composite/parser';
import * as t from '@composite/types';
import { Cross2Icon } from '@radix-ui/react-icons';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { styled } from '@app/stitches.config';
import { TextField } from '@app/components/text-field';
import { SettingField } from './shared';

const stringifier = new Stringifier();
const parser = new Parser();

type EditPropFieldProps = {
  template: t.Template;
  prop: string;
};

const RemoveProp = styled('button', {
  position: 'absolute',
  right: '-8px',
  top: '-8px',
  width: '15px',
  height: '15px',
  borderRadius: '100px',
  background: 'rgba(255,255,255,0.2)',
  textAlign: 'center',
  svg: {
    margin: '0 auto',
    width: '10px',
    height: '10px',
  },
});

const EditPropSettingField = styled(SettingField, {
  [`& ${RemoveProp}`]: {
    display: 'none',
  },
  '&:hover': {
    [`& ${RemoveProp}`]: {
      display: 'block',
    },
  },
});

export const EditPropField = ({ template, prop }: EditPropFieldProps) => {
  const editor = useEditor();
  const [value, setValue] = React.useState(
    stringifier.toString(template.props[prop])
  );

  return (
    <EditPropSettingField>
      <h4>{prop}</h4>
      <TextField
        badge="expression"
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
      <RemoveProp
        onClick={() => {
          editor.state.change(() => {
            delete template.props[prop];
          });
        }}
      >
        <Cross2Icon />
      </RemoveProp>
    </EditPropSettingField>
  );
};
