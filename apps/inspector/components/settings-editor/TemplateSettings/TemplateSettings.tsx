import * as t from '@composite/types';
import * as React from 'react';

import { Box } from '@app/components/box';
import { useEditor } from '@app/editor';
import { TextField } from '@app/components/text-field';
import { Dropdown } from '@app/components/dropdown';
import { styled } from '@app/styles';
import { ChevronDownIcon } from '@radix-ui/react-icons';

import { SharedTemplateSettings } from './SharedTemplateSettings';
import { TagTemplateSettings } from './TagTemplateSettings';
import { ComponentTemplateSettings } from './ComponentTemplateSettings';

const Topbar = styled('div', {
  display: 'flex',
  px: '$3',
  py: '$3',
});

const StyledTemplateTypeHeading = styled('div', {
  input: {
    padding: '2px 4px',
    marginLeft: '-4px',
    marginRight: '-4px',
    fontSize: '$4',

    '&:hover': {
      background: '$grayA5',
    },
  },
  '> span': {
    fontSize: '10px',
    color: 'rgba(0,0,0,0.8)',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    mt: '2px',
    cursor: 'pointer',
    svg: {
      display: 'inline-block',
      width: '10px',
      height: '10px',
      ml: '$1',
    },
  },
});

type TemplateHeadingProps = {
  template: t.Template;
};

const TemplateHeading = (props: TemplateHeadingProps) => {
  let title: string;

  const editor = useEditor();

  if (props.template instanceof t.ComponentTemplate) {
    title = props.template.component.name;
  } else if (props.template instanceof t.TagTemplate) {
    title = props.template.tag;
  } else if (props.template instanceof t.SlotTemplate) {
    title = 'Slot';
  } else {
    title = 'Template';
  }

  const [newTitleValue, setNewTitleValue] = React.useState(title);

  return (
    <StyledTemplateTypeHeading>
      <TextField
        value={newTitleValue}
        transparent
        onChange={(e) => {
          setNewTitleValue(e.target.value);
        }}
        onKeyUp={(e) => {
          if (e.key === 'Escape') {
            setNewTitleValue(title);
            return;
          }

          if (e.key !== 'Enter') {
            return;
          }

          const template = props.template;

          if (template instanceof t.TagTemplate) {
            editor.state.change(() => {
              template.tag = newTitleValue;
            });
          }
        }}
      />
      <Dropdown>
        <span>
          {props.template.type} <ChevronDownIcon />
        </span>
      </Dropdown>
    </StyledTemplateTypeHeading>
  );
};

type TemplateSettingsProps = {
  template: t.Template;
};

export const TemplateSettings = (props: TemplateSettingsProps) => {
  return (
    <Box>
      <Topbar>
        <TemplateHeading template={props.template} />
      </Topbar>
      <Box css={{ mt: '$3' }}>
        <SharedTemplateSettings template={props.template} />
        {props.template instanceof t.TagTemplate && (
          <TagTemplateSettings template={props.template} />
        )}
        {props.template instanceof t.ComponentTemplate && (
          <ComponentTemplateSettings template={props.template} />
        )}
      </Box>
    </Box>
  );
};
