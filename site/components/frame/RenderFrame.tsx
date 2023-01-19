import { ChatBubbleIcon } from '@radix-ui/react-icons';
import * as t from '@rekajs/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import IFrame from 'react-frame-component';
import { ThreeDots } from 'react-loader-spinner';

import { useEditor } from '@app/editor';
import { ActiveFrame } from '@app/editor/ComponentEditor';
import { EditorMode } from '@app/editor/Editor';

import { FrameContext } from './FrameContext';
import { Renderer } from './renderer';

import { Box } from '../box';
import { IconButton } from '../button';
import { Text } from '../text';

type RenderFrameProps = {
  frame: ActiveFrame;
  scale: number;
};

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
      const iframeRect = iframe.getBoundingClientRect();

      const left = iframe.offsetLeft + domRect.left;
      const top = iframe.offsetTop + domRect.top;

      containerDom.style.opacity = '1';
      containerDom.style.left = Math.max(iframe.offsetLeft, left) + 'px';
      containerDom.style.top =
        Math.min(
          iframeRect.height + iframe.offsetTop,
          Math.max(iframe.offsetTop, top)
        ) + 'px';
      containerDom.style.height = domRect.height + 'px';
      containerDom.style.width = domRect.width + 'px';

      if (
        left < iframe.offsetLeft ||
        top <= iframe.offsetTop ||
        top >= iframeRect.height + iframe.offsetTop
      ) {
        containerDom.classList.add('overflow');

        if (top <= iframe.offsetTop) {
          containerDom.classList.add('overflow-top');
        } else {
          containerDom.classList.add('overflow-bottom');
        }

        return;
      }

      containerDom.classList.remove(
        'overflow',
        'overflow-top',
        'overflow-bottom'
      );
    };

    let animationReq: null | number = null;

    const animationLoop = () => {
      setPos();

      window.requestAnimationFrame(() => {
        animationLoop();
      });
    };

    animationReq = window.requestAnimationFrame(() => animationLoop());

    return () => {
      if (animationReq !== null) {
        window.cancelAnimationFrame(animationReq);
      }
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
          borderColor: 'transparent',
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

          <Box css={{ pl: '$3', display: 'flex', alignItems: 'center' }}>
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

const RenderSelectionBorders = observer(() => {
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

export const RenderFrame = observer((props: RenderFrameProps) => {
  const editor = useEditor();

  React.useLayoutEffect(() => {
    window.requestAnimationFrame(() => {
      props.frame.state.enableSync();
    });
  }, [props.frame]);

  return (
    <React.Fragment>
      {!props.frame.state.view ? (
        <Box
          css={{
            position: 'absolute',
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#fff',
          }}
        >
          <ThreeDots
            height="50"
            width="50"
            color="#4563df"
            radius="3"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </Box>
      ) : (
        <React.Fragment>
          <IFrame
            initialContent='<!DOCTYPE html><html><head><link href="/frame.css" rel="stylesheet" /></head><body><div id="root"></div></body></html>'
            mountTarget="#root"
            ref={(dom: any) => {
              editor.registerIframe(dom);
            }}
            style={{ transform: `scale(${props.scale})` }}
          >
            <FrameContext.Provider value={props.frame.state}>
              <Renderer
                key={props.frame.state.view.id}
                view={props.frame.state.view}
              />
            </FrameContext.Provider>
          </IFrame>

          <RenderSelectionBorders />
        </React.Fragment>
      )}
    </React.Fragment>
  );
});
