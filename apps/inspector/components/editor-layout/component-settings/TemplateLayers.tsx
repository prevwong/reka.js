import { useCollector } from '@composite/react';
import * as t from '@composite/types';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { Box } from '@app/components/box';
import { IconButton } from '@app/components/button';
import { Dropdown } from '@app/components/dropdown';
import { Text } from '@app/components/text';
import { Tooltip } from '@app/components/tooltip';
import { useEditor } from '@app/editor';

import { AddTemplateModal } from './AddTemplateModal';

type AddTemplateButtonProps = {
  target: t.Template;
};

const AddTemplateButton = (props: AddTemplateButtonProps) => {
  const [option, setOption] = React.useState<
    'before' | 'after' | 'child' | null
  >(null);

  const editor = useEditor();

  return (
    <React.Fragment>
      <Dropdown
        items={[
          {
            title: 'Add Before',
            onSelect: () => {
              setOption('before');
            },
          },
          {
            title: 'Add After',
            onSelect: () => {
              setOption('after');
            },
          },
          {
            title: 'Add child',
            onSelect: () => {
              setOption('child');
            },
          },
        ]}
      >
        <IconButton transparent>
          <PlusIcon />
        </IconButton>
      </Dropdown>
      <AddTemplateModal
        isOpen={!!option}
        onClose={() => {
          setOption(null);
        }}
        onAdd={(template) => {
          setOption(null);

          editor.composite.change(() => {
            if (option === 'child') {
              props.target.children.push(template);
              return;
            }

            const parent = editor.composite.getParent(props.target);

            if (!parent) {
              return;
            }

            if (!(parent.node instanceof t.Template)) {
              return;
            }

            const indexInParent = parent.node.children.indexOf(props.target);

            if (indexInParent === -1) {
              return;
            }

            if (option === 'after') {
              parent.node.children.splice(indexInParent + 1, 0, template);
              return;
            }

            parent.node.children.splice(indexInParent, 0, template);
          });
        }}
      />
    </React.Fragment>
  );
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

type RenderTemplateNodeProps = {
  templateId: string;
  depth?: number;
};

const RenderTemplateNode = observer((props: RenderTemplateNodeProps) => {
  const depth = props.depth ?? 0;

  const editor = useEditor();

  const { template } = useCollector((composite) => {
    let collectedTemplateValues;

    const template = composite.getNodeFromId(props.templateId, t.Template);

    if (template) {
      let parentNode: t.Template | null = null;

      const parent = composite.getParent(template);

      if (parent && parent.node instanceof t.Template) {
        parentNode = parent.node;
      }

      collectedTemplateValues = {
        id: template.id,
        name: getTemplateName(template),
        parent: parentNode,
        data: template,
      };
    }

    return {
      template: collectedTemplateValues,
    };
  });

  if (!template) {
    return null;
  }

  const isSelected =
    editor.activeComponentEditor?.tplEvent.selected?.id === props.templateId;

  return (
    <Box>
      <Box
        css={{
          px: '$4',
          py: '$2',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: '$secondary2',
          },
          backgroundColor: isSelected ? '$indigoA3!important' : 'transparent',
        }}
      >
        <Box
          css={{
            display: 'flex',
            marginLeft: depth * 10 + 'px',
            alignItems: 'center',
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            if (!editor.activeComponentEditor) {
              return;
            }

            editor.activeComponentEditor.setTplEvent('selected', template.data);
          }}
          onMouseOver={(e) => {
            e.stopPropagation();
            if (!editor.activeComponentEditor) {
              return;
            }

            editor.activeComponentEditor.setTplEvent('hovered', template.data);
          }}
          onMouseOut={() => {
            if (!editor.activeComponentEditor) {
              return;
            }

            if (
              editor.activeComponentEditor.tplEvent.hovered?.id !==
              props.templateId
            ) {
              return;
            }

            editor.activeComponentEditor.setTplEvent('hovered', null);
          }}
        >
          <Text size="1" css={{ flex: 1 }}>
            {template.name}
          </Text>
          <Box>
            <Tooltip content="Add new template">
              <AddTemplateButton target={template.data} />
            </Tooltip>

            <Tooltip content="Remove template">
              <IconButton
                transparent
                onClick={(e) => {
                  e.stopPropagation();
                  editor.composite.change(() => {
                    const parent = template.parent;

                    if (!parent) {
                      return;
                    }

                    editor.composite.change(() => {
                      parent.children.splice(
                        parent.children.indexOf(template.data),
                        1
                      );
                    });
                  });
                }}
              >
                <TrashIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      {template.data.children.map((child) => (
        <RenderTemplateNode
          key={child.id}
          templateId={child.id}
          depth={depth + 1}
        />
      ))}
    </Box>
  );
});

type TemplateLayersProps = {
  componentId: string;
};

export const TemplateLayers = (props: TemplateLayersProps) => {
  const { component } = useCollector((composite) => ({
    component: composite.getNodeFromId(props.componentId, t.CompositeComponent),
  }));

  if (!component) {
    return null;
  }

  return (
    <Box css={{ mt: '$3', ml: '-$4', mr: '-$4' }}>
      {component.template && (
        <RenderTemplateNode templateId={component.template.id} />
      )}
    </Box>
  );
};
