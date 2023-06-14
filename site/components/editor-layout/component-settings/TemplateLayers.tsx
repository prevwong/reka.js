import { ChatBubbleIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import * as t from '@rekajs/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { IconButton } from '@app/components/button';
import { Dropdown } from '@app/components/dropdown';
import { Tooltip } from '@app/components/tooltip';
import { useEditor } from '@app/editor';
import { cn } from '@app/utils';

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
        <span>
          <Tooltip content="Add new template">
            <IconButton>
              <PlusIcon />
            </IconButton>
          </Tooltip>
        </span>
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
              if (!(props.target instanceof t.SlottableTemplate)) {
                return;
              }

              props.target.children.push(template);
              return;
            }

            const parent = editor.reka.getParent(props.target);

            if (!parent) {
              return;
            }

            if (!(parent.node instanceof t.SlottableTemplate)) {
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
        className={cn(
          'template-layer-name px-4 py-0.5 cursor-pointer rounded-md my-1',
          {
            'bg-primary/10 text-primary': isSelected,
            'hover:bg-gray-100': !isSelected,
          }
        )}
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
            <span className="text-xs">{getTemplateName(template)}</span>
            {activeComponentEditor.getCommentCount(template) > 0 && (
              <Tooltip content="View comments">
                <IconButton
                  onClick={() => {
                    activeComponentEditor.showComments(template);
                  }}
                >
                  <ChatBubbleIcon />
                  <span className="text-[0.6rem] mt-px -mb-px ml-1.5">
                    {activeComponentEditor.getCommentCount(template)}
                  </span>
                </IconButton>
              </Tooltip>
            )}
          </div>
          <div>
            <AddTemplateButton target={template} />

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

                    if (!(parentNode instanceof t.SlottableTemplate)) {
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
      {t.is(template, t.SlottableTemplate) &&
        template.children.map((child) => (
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
    <div className="mt-3">
      {component.template && (
        <RenderTemplateNode templateId={component.template.id} />
      )}
    </div>
  );
};
