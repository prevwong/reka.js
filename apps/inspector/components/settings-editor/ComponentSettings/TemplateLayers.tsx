import * as t from '@composite/types';

import { Box } from '@app/components/box';

import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { Text } from '@app/components/text';
import { Editor } from '@app/editor/Editor';
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

type RenderTemplateNodeProps = {
  template: t.Template;
  depth?: number;
};

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

const RenderTemplateNode = observer((props: RenderTemplateNodeProps) => {
  const depth = props.depth ?? 0;

  const editor = useEditor();

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
            template: props.template,
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
            {getTemplateName(props.template)}
          </Text>
          <Box>
            <Tooltip content="Add new template">
              <AddTemplateButton target={props.template} />
            </Tooltip>
            <Tooltip content="Move template up">
              <IconButton
                transparent
                onClick={(e) => {
                  e.stopPropagation();
                  const originalParent = editor.state.getParentType(
                    props.template
                  );
                  let newParent = originalParent;

                  if (!Array.isArray(originalParent.value)) {
                    return;
                  }

                  let newIndex = originalParent.key - 1;

                  if (newIndex < 0) {
                    const parentTemplate = editor.state.getParentType(
                      originalParent.value
                    );

                    // grandparent's children array:
                    newParent = editor.state.getParentType(
                      parentTemplate.value
                    );

                    if (!Array.isArray(newParent.value)) {
                      return;
                    }

                    newIndex = newParent.key - 1;
                  }

                  editor.state.change(() => {
                    originalParent.value.splice(originalParent.key, 1);
                    newParent.value.splice(newIndex, 0, props.template);
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

                  const originalParent = editor.state.getParentType(
                    props.template
                  );
                  let newParent = originalParent;

                  let newIndex = originalParent.key + 2;

                  if (!Array.isArray(originalParent.value)) {
                    const parentTemplate = editor.state.getParentType(
                      originalParent.value
                    );

                    newParent = editor.state.getParentType(
                      parentTemplate.value
                    );

                    if (!Array.isArray(newParent.value)) {
                      return;
                    }

                    newIndex = newParent.key + 1;
                  }

                  editor.state.change(() => {
                    newParent.value.splice(newIndex, 0, props.template);
                    originalParent.value.splice(originalParent.key, 1);
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
                    const parent = editor.state.getParentType(props.template);

                    if (!parent || !Array.isArray(parent.value)) {
                      return;
                    }

                    editor.state.change(() => {
                      parent.value.splice(parent.key, 1);
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
