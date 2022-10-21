import * as t from '@composite/types';

import { Box } from '@app/components/box';

import * as React from 'react';
import { Text } from '@app/components/text';
import { useEditor } from '@app/editor';
import { IconButton } from '@app/components/button';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { Tooltip } from '@app/components/tooltip';
import { Dropdown } from '@app/components/dropdown';
import { AddTemplateModal } from '../AddTemplateModal';
import { useCollector } from '@composite/react';

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

          editor.state.change(() => {
            if (option === 'child') {
              props.target.children.push(template);
              return;
            }

            const parent = editor.state.getParentType(props.target);

            if (!parent || !Array.isArray(parent.value)) {
              return;
            }

            const indexInParent = parent.value.indexOf(props.target);

            if (indexInParent === -1) {
              return;
            }

            if (option === 'after') {
              parent.value.splice(indexInParent + 1, 0, template);
              return;
            }

            parent.value.splice(indexInParent, 0, template);
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

const RenderTemplateNode = (props: RenderTemplateNodeProps) => {
  const depth = props.depth ?? 0;

  const editor = useEditor();

  const { template } = useCollector((query) => {
    let collectedTemplateValues;

    const template = query.getTemplateById(props.templateId);

    if (template) {
      collectedTemplateValues = {
        id: template.id,
        name: getTemplateName(template.data),
        parent: template.getParent(),
        grandparent: template.getParent()?.getParent(),
        children: template.children.map((child) => child.id),
        index: template.index,
        data: template.data,
      };
    }

    return {
      template: collectedTemplateValues,
    };
  });

  if (!template) {
    return null;
  }

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
        }}
        onClick={(e) => {
          editor.settings.goTo({
            type: 'template',
            template: template.data,
          });
        }}
      >
        <Box
          css={{
            display: 'flex',
            marginLeft: depth * 10 + 'px',
            alignItems: 'center',
          }}
        >
          <Text size="1" css={{ flex: 1 }}>
            {template.name}
          </Text>
          <Box>
            <Tooltip content="Add new template">
              <AddTemplateButton target={template.data} />
            </Tooltip>
            <Tooltip content="Move template up">
              <IconButton
                transparent
                onClick={(e) => {
                  e.stopPropagation();

                  if (!template.parent) {
                    return;
                  }

                  const originalParent = template.parent;

                  let newParent = originalParent;

                  let newIndex = template.index - 1;

                  if (newIndex < 0) {
                    // grandparent's children array:
                    if (!template.grandparent) {
                      return;
                    }

                    newParent = template.grandparent;
                    newIndex = template.parent.index - 1;
                  }

                  editor.state.change(() => {
                    originalParent.data.children.splice(template.index, 1);
                    newParent.data.children.splice(newIndex, 0, template.data);
                  });
                }}
              >
                <ArrowUpIcon />
              </IconButton>
            </Tooltip>
            <Tooltip content="Move template down">
              <IconButton
                transparent
                onClick={(e) => {
                  e.stopPropagation();

                  const originalParent = template.parent;

                  if (!originalParent) {
                    return;
                  }

                  let newParent = originalParent;
                  let newIndex = template.index + 2;

                  editor.state.change(() => {
                    newParent.data.children.splice(newIndex, 0, template.data);
                    originalParent.data.children.splice(template.index, 1);
                  });
                }}
              >
                <ArrowDownIcon />
              </IconButton>
            </Tooltip>
            <Tooltip content="Remove template">
              <IconButton
                transparent
                onClick={(e) => {
                  e.stopPropagation();
                  editor.state.change(() => {
                    const parent = template.parent;

                    if (!parent) {
                      return;
                    }

                    editor.state.change(() => {
                      parent.children.splice(template.index, 1);
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
      {template.children.map((child) => (
        <RenderTemplateNode key={child} templateId={child} depth={depth + 1} />
      ))}
    </Box>
  );
};

type TemplateLayersProps = {
  componentId: string;
};

export const TemplateLayers = (props: TemplateLayersProps) => {
  const { component } = useCollector((query) => ({
    component: query.getComponentById(props.componentId),
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
