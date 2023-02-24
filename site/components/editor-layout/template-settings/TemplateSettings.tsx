import * as t from '@rekajs/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { Box } from '@app/components/box';
import { Text } from '@app/components/text';
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

  if (props.template instanceof t.ComponentTemplate) {
    title = props.template.component.name;
  } else if (props.template instanceof t.TagTemplate) {
    title = props.template.tag;
  } else if (props.template instanceof t.SlotTemplate) {
    title = 'Slot';
  } else {
    title = 'Template';
  }

  return (
    <StyledTemplateTypeHeading>
      <Box css={{ flex: 1, fontSize: '$4' }}>
        <span>{title}</span>
      </Box>
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
    return (
      <Box
        css={{
          px: '$8',
          py: '$4',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          textAlign: 'center',
          gap: '$2',
        }}
      >
        <Text size={2} css={{ color: '$slate10', lineHeight: '1.2rem' }}>
          Click on an element on the screen to start editing a template.
        </Text>
      </Box>
    );
  }

  return <InternalTemplateSettings key={template.id} template={template} />;
});
