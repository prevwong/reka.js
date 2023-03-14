import { ChatBubbleIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import * as t from '@rekajs/types';
import cx from 'classnames';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

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
        <IconButton>
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

          editor.reka.change(() => {
            if (option === 'child') {
              props.target.children.push(template);
              return;
            }

            const parent = editor.reka.getParent(props.target);

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

  const template = editor.reka.getNodeFromId(props.templateId, t.Template);

  if (!template) {
    return null;
  }

  const activeComponentEditor = editor.activeComponentEditor;

  if (!activeComponentEditor) {
    return null;
  }

  const isSelected =
    activeComponentEditor.tplEvent.selected?.id === props.templateId;

  return (
    <div>
      <div
        className={cx('px-4 py-2 cursor-pointer', {
          'bg-primary/10': isSelected,
          'hover:bg-secondary/20': !isSelected,
        })}
      >
        <div
          className="flex items-center"
          style={{ marginLeft: `${depth * 10}px` }}
          onMouseDown={(e) => {
            e.stopPropagation();

            activeComponentEditor.setTplEvent('selected', template);
          }}
          onMouseOver={(e) => {
            e.stopPropagation();

            activeComponentEditor.setTplEvent('hovered', template);
          }}
          onMouseOut={() => {
            if (
              activeComponentEditor.tplEvent.hovered?.id !== props.templateId
            ) {
              return;
            }

            activeComponentEditor.setTplEvent('hovered', null);
          }}
        >
          <div className="flex flex-1 gap-2 items-center">
            <Text size="1">{getTemplateName(template)}</Text>
            {activeComponentEditor.getCommentCount(template) > 0 && (
              <Tooltip content="View comments">
                <IconButton
                  onClick={() => {
                    activeComponentEditor.showComments(template);
                  }}
                >
                  <ChatBubbleIcon />
                  <Text size="1" css={{ ml: '$2' }}>
                    {activeComponentEditor.getCommentCount(template)}
                  </Text>
                </IconButton>
              </Tooltip>
            )}
          </div>
          <div>
            <Tooltip content="Add new template">
              <AddTemplateButton target={template} />
            </Tooltip>

            <Tooltip content="Remove template">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  editor.reka.change(() => {
                    const parent = editor.reka.getParent(template, t.Template);

                    if (!parent) {
                      return;
                    }

                    const parentNode = parent.node;

                    if (!(parentNode instanceof t.Template)) {
                      return;
                    }

                    editor.reka.change(() => {
                      parentNode.children.splice(
                        parentNode.children.indexOf(template),
                        1
                      );
                    });
                  });
                }}
              >
                <TrashIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>
      {template.children.map((child) => (
        <RenderTemplateNode
          key={child.id}
          templateId={child.id}
          depth={depth + 1}
        />
      ))}
    </div>
  );
});

type TemplateLayersProps = {
  componentId: string;
};

export const TemplateLayers = (props: TemplateLayersProps) => {
  const editor = useEditor();

  const component = editor.reka.getNodeFromId(
    props.componentId,
    t.RekaComponent
  );

  if (!component) {
    return null;
  }

  return (
    <div className="mt-3 -ml-4 -mr-4">
      {component.template && (
        <RenderTemplateNode templateId={component.template.id} />
      )}
    </div>
  );
};
