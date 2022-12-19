import * as t from '@composite/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { Box } from '@app/components/box';
import { TextField } from '@app/components/text-field';
import { useEditor } from '@app/editor';
import { styled } from '@app/styles';

import { ComponentTemplateSettings } from './ComponentTemplateSettings';
import { SharedTemplateSettings } from './SharedTemplateSettings';
import { TagTemplateSettings } from './TagTemplateSettings';

const Topbar = styled('div', {
  display: 'flex',
  px: '$4',
  py: '$3',
  mt: '$4',
});

const StyledTemplateTypeHeading = styled('div', {
  display: 'flex',
  alignItems: 'center',
  flex: 1,
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
        css={{ flex: 1 }}
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
            editor.composite.change(() => {
              template.tag = newTitleValue;
            });
          }
        }}
      />
      <Box
        css={{
          fontSize: '10px',
          backgroundColor: '$primary2',
          color: '$primary5',
          display: 'inline-block',
          width: 'auto',
          px: '$3',
          py: '$2',
          borderRadius: '$4',
          alignSelf: 'flex-end',
        }}
      >
        {props.template.type}
      </Box>
    </StyledTemplateTypeHeading>
  );
};

const InternalTemplateSettings = ({ template }: any) => {
  return (
    <Box>
      <Topbar>
        <TemplateHeading key={template.id} template={template} />
      </Topbar>
      <Box css={{ mt: '$3' }}>
        <SharedTemplateSettings key={template.id} template={template} />
        {template instanceof t.TagTemplate && (
          <TagTemplateSettings key={template.id} template={template} />
        )}
        {template instanceof t.ComponentTemplate && (
          <ComponentTemplateSettings key={template.id} template={template} />
        )}
      </Box>
    </Box>
  );
};

export const TemplateSettings = observer(() => {
  const editor = useEditor();

  const template = editor.activeComponentEditor?.tplEvent.selected;

  if (!template) {
    return null;
  }

  return <InternalTemplateSettings key={template.id} template={template} />;
});
