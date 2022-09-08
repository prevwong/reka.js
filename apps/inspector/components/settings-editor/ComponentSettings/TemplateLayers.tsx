import * as t from '@composite/types';

import { Box } from '@app/components/box';

import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { Text } from '@app/components/text';
import { Editor } from '@app/editor/Editor';
import { useEditor } from '@app/editor';

type RenderTemplateNodeProps = {
  template: t.Template;
  depth?: number;
};

const getTemplateName = (template: t.Template) => {
  if (template instanceof t.TagTemplate) {
    return template.tag;
  }

  if (template instanceof t.ComponentTemplate) {
    return template.component.name;
  }

  if (template instanceof t.SlotTemplate) {
    return `<slot />`;
  }

  throw new Error();
};

const RenderTemplateNode = observer((props: RenderTemplateNodeProps) => {
  const depth = props.depth ?? 0;

  const editor = useEditor();

  return (
    <Box>
      <Box
        css={{
          px: '$4',
          py: '$3',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: '$secondary',
          },
        }}
        onClick={() => {
          editor.settings.goTo({
            type: 'template',
            template: props.template,
          });
        }}
      >
        <Box
          css={{
            marginLeft: depth * 10 + 'px',
          }}
        >
          <Text size="1">{getTemplateName(props.template)}</Text>
        </Box>
      </Box>
      {props.template.children.map((child) => (
        <RenderTemplateNode key={child.id} template={child} depth={depth + 1} />
      ))}
    </Box>
  );
});

type TemplateLayersProps = {
  component: t.CompositeComponent;
};

export const TemplateLayers = observer((props: TemplateLayersProps) => {
  return (
    <Box css={{ mt: '$3', ml: '-$4', mr: '-$4' }}>
      <RenderTemplateNode template={props.component.template} />
    </Box>
  );
});
