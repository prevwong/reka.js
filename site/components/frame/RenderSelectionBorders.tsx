import { ChatBubbleIcon, Pencil1Icon } from '@radix-ui/react-icons';
import * as t from '@rekajs/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { EditorMode } from '@app/editor/Editor';

import { Box } from '../box';
import { IconButton } from '../button';
import { Text } from '../text';
import { Tooltip } from '../tooltip';

type SelectionBorderProps = {
  dom: HTMLElement;
  template: t.Template;
  type: 'hovered' | 'selected';
};

const SelectionBorder = observer((props: SelectionBorderProps) => {
  const editor = useEditor();

  const activeComponentEditor = editor.activeComponentEditor;

  const containerDomRef = React.useRef<HTMLDivElement | null>(null);

  const iframe = editor.iframe;

  React.useEffect(() => {
    if (!iframe) {
      return;
    }

    if (!iframe) {
      return;
    }

    const { current: containerDom } = containerDomRef;

    if (!containerDom) {
      return;
    }

    const setPos = () => {
      const domRect = props.dom.getBoundingClientRect();

      const left = iframe.offsetLeft + domRect.left;
      const top = iframe.offsetTop + domRect.top;

      containerDom.style.opacity = '1';
      containerDom.style.left = Math.max(iframe.offsetLeft, left) + 'px';
      containerDom.style.top =
        Math.min(
          iframe.clientHeight + iframe.offsetTop,
          Math.max(iframe.offsetTop, top)
        ) + 'px';
      containerDom.style.height = domRect.height + 'px';
      containerDom.style.width = domRect.width + 'px';

      if (
        left < iframe.offsetLeft ||
        top <= iframe.offsetTop ||
        top >= iframe.clientHeight + iframe.offsetTop
      ) {
        containerDom.classList.add('overflow');

        if (!(top === 0 && left === 0)) {
          containerDom.classList.add('overflow-border-hidden');
        } else {
          containerDom.classList.remove('overflow-border-hidden');
        }

        if (top <= iframe.offsetTop) {
          containerDom.classList.add('overflow-top');
        } else {
          containerDom.classList.add('overflow-bottom');
        }

        return;
      }

      containerDom.classList.remove(
        'overflow',
        'overflow-border-hidden',
        'overflow-top',
        'overflow-bottom'
      );
    };

    setPos();

    const observer = new ResizeObserver(() => {
      setPos();
    });
    const observedEl = props.dom.parentElement ?? props.dom;
    observer.observe(observedEl);

    iframe.contentWindow?.addEventListener('scroll', setPos);

    return () => {
      observer.unobserve(observedEl);
      iframe.contentWindow?.removeEventListener('scroll', setPos);
    };
  }, [iframe, props.dom, props.template]);

  const templateName = React.useMemo(() => {
    if (props.template instanceof t.TagTemplate) {
      return props.template.tag;
    }

    if (props.template instanceof t.ComponentTemplate) {
      return props.template.component.name;
    }

    if (props.template instanceof t.SlotTemplate) {
      return '<slot>';
    }

    return 'Template';
  }, [props.template]);

  const templateType = React.useMemo(() => {
    if (props.template instanceof t.TagTemplate) {
      return 'tag';
    }

    if (props.template instanceof t.ComponentTemplate) {
      return 'component';
    }

    if (props.template instanceof t.SlotTemplate) {
      return 'slot';
    }

    return 'Unknown';
  }, [props.template]);

  if (!activeComponentEditor) {
    return null;
  }

  return (
    <Box
      css={{
        position: 'absolute',
        zIndex: '2',
        border: '1px solid $indigoA9',
        pointerEvents: 'none',
        opacity: 0,
        '&.overflow': {
          '&.overflow-border-hidden': {
            borderColor: 'transparent',
          },
          '&.overflow-top': {
            '> div': {
              top: 0,
            },
          },
          '&.overflow-bottom': {
            '> div': {
              bottom: 0,
            },
          },
        },
      }}
      ref={containerDomRef}
    >
      <Box
        css={{
          position: 'relative',
          top: '-30px',
          background: props.type === 'selected' ? '$indigo9' : '$purple9',
          color: '#fff',
          px: '$3',
          py: '$2',
          fontSize: '$1',
          height: '30px',
          left: '-1px',
          display: 'inline-block',
          pointerEvents: 'all',
        }}
      >
        <Box css={{ display: 'flex', alignItems: 'center' }}>
          <Box css={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Text size={2}>{templateName}</Text>
            <Text css={{ ml: '$2', opacity: 0.7 }} size={1}>
              {'<'}
              {templateType}
              {'>'}
            </Text>
          </Box>

          <Box
            css={{ pl: '$3', display: 'flex', alignItems: 'center', gap: '$2' }}
          >
            {props.template instanceof t.ComponentTemplate && (
              <Tooltip
                content={
                  props.template.component.external
                    ? 'This is an external React component, it cannot be edited.'
                    : 'Edit component'
                }
              >
                <IconButton
                  disabled={props.template.component.external}
                  transparent
                  css={{
                    color: '#fff',
                    '&:hover': {
                      background: '$slateA5',
                    },
                  }}
                  onClick={() => {
                    const template = props.template;

                    if (!(template instanceof t.ComponentTemplate)) {
                      return;
                    }

                    if (template.component.external) {
                      return;
                    }

                    const component = editor.reka.components.program.find(
                      (component) => component.name === template.component.name
                    );

                    if (!component) {
                      return;
                    }

                    editor.setActiveComponentEditor(component);
                  }}
                >
                  <Pencil1Icon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip content="View comments">
              <IconButton
                transparent
                css={{
                  color: '#fff',
                  '&:hover': {
                    background: '$slateA5',
                  },
                }}
                onClick={() => {
                  activeComponentEditor.showComments(props.template);
                }}
              >
                <ChatBubbleIcon />
                {activeComponentEditor.getCommentCount(props.template) > 0 && (
                  <Box css={{ ml: '$3', fontSize: '9px' }}>
                    {editor.activeComponentEditor?.getCommentCount(
                      props.template
                    )}
                  </Box>
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

type SelectionBordersProps = {
  template: t.Template;
  type: 'hovered' | 'selected';
};

const SelectionBorders = (props: SelectionBordersProps) => {
  const editor = useEditor();

  const doms =
    editor.activeComponentEditor?.activeFrame?.tplElements.get(
      props.template
    ) ?? [];

  return (
    <React.Fragment>
      {[...doms].map((dom, i) => (
        <SelectionBorder
          dom={dom}
          key={i}
          template={props.template}
          type={props.type}
        />
      ))}
    </React.Fragment>
  );
};

export const RenderSelectionBorders = observer(() => {
  const editor = useEditor();

  const activeComponentEditor = editor.activeComponentEditor;

  if (editor.mode === EditorMode.Preview) {
    return null;
  }

  if (!activeComponentEditor) {
    return null;
  }

  const activeFrame = activeComponentEditor.activeFrame;

  if (!activeFrame) {
    return null;
  }

  return (
    <React.Fragment>
      {activeComponentEditor.tplEvent.selected && (
        <SelectionBorders
          template={activeComponentEditor.tplEvent.selected}
          type="selected"
        />
      )}
      {activeComponentEditor.tplEvent.hovered &&
        activeComponentEditor.tplEvent.hovered.id !==
          activeComponentEditor.tplEvent.selected?.id && (
          <SelectionBorders
            template={activeComponentEditor.tplEvent.hovered}
            type="hovered"
          />
        )}
    </React.Fragment>
  );
});
