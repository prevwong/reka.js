import { Frame as CompositeFrame } from '@composite/state';
import * as t from '@composite/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import IFrame from 'react-frame-component';

import { useEditor } from '@app/editor';
import { styled } from '@app/styles';

import { FrameContext } from './FrameContext';
import { Renderer } from './Renderer';

import { Box } from '../box';
import { Text } from '../text';

type RenderFrameProps = {
  frame: CompositeFrame;
  width?: string;
  height?: string;
};

const StyledFrameContainer = styled('div', {
  width: '100%',
  height: '100%',
  padding: 0,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '$grayA5',
  '> iframe': {
    display: 'block',
    margin: '0 auto',
    width: '100%',
    height: '100%',
    boxShadow: 'none',
    border: '1px solid transparent',
    borderRadius: 0,
    background: '#fff',
  },
  variants: {
    isNotFullWidth: {
      true: {
        padding: '$4',
        '> iframe': {
          borderColor: 'rgb(0 0 0 / 7%)',
          borderRadius: '$1',
        },
      },
    },
  },
});

type SelectionBorderProps = {
  dom: HTMLElement;
  template: t.Template;
  type: 'hovered' | 'selected';
};

const SelectionBorder = observer((props: SelectionBorderProps) => {
  const editor = useEditor();

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

    setPos();

    const animationLoop = () => {
      setPos();

      window.requestAnimationFrame(() => {
        animationLoop();
      });
    };

    animationLoop();
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

  return (
    <Box
      css={{
        position: 'absolute',
        zIndex: '2',
        border: '1px solid $indigoA9',
        pointerEvents: 'none',
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
          top: '-22px',
          background: props.type === 'selected' ? '$indigo9' : '$purple9',
          color: '#fff',
          px: '$3',
          py: '$2',
          fontSize: '$1',
          height: '22px',
          left: '-1px',
          display: 'inline-block',
          pointerEvents: 'all',
        }}
      >
        <Box css={{ display: 'flex', alignItems: 'center' }}>
          <Text size={3}>{templateName}</Text>
          <Text css={{ ml: '$2', opacity: 0.7 }} size={1}>
            {templateType}
          </Text>
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

  const isFullWidth = props.width === '100%' && props.height === '100%';
  const isUnset = !props.width && !props.height;

  const isNotFullWidth = !isFullWidth && !isUnset;

  return (
    <StyledFrameContainer isNotFullWidth={isNotFullWidth}>
      <IFrame
        initialContent='<!DOCTYPE html><html><head><link href="/tailwind.css" rel="stylesheet" /><link href="/frame.css" rel="stylesheet" /></head><body><div id="root"></div></body></html>'
        mountTarget="#root"
        style={{
          maxWidth: props.width,
          maxHeight: props.height,
        }}
        ref={(dom: any) => {
          editor.registerIframe(dom);
        }}
      >
        <FrameContext.Provider value={props.frame}>
          {props.frame.root && (
            <Renderer key={props.frame.root.id} view={props.frame.root} />
          )}
        </FrameContext.Provider>
      </IFrame>
      <RenderSelectionBorders />
    </StyledFrameContainer>
  );
});
