import * as t from '@rekajs/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import IFrame from 'react-frame-component';
import { ThreeDots } from 'react-loader-spinner';

import { useEditor } from '@app/editor';
import { ActiveFrame } from '@app/editor/ComponentEditor';
import { styled } from '@app/styles';

import { FrameContext } from './FrameContext';
import { RenderSelectionBorders } from './RenderSelectionBorders';
import { Renderer } from './Renderer';

import { Box } from '../box';

const isNotFullWidth = (
  width: number | string | undefined,
  height: number | string | undefined
) => {
  const isFullWidth = width === '100%' && height === '100%';
  const isUnset = !width && !height;

  const isNotFullWidth = !isFullWidth && !isUnset;

  return isNotFullWidth;
};

const StyledFrameContainer = styled('div', {
  width: '100%',
  height: '100%',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  transformOrigin: '0px 0px',
  minHeight: '100%',
  maxHeight: '100%',
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

type RenderFrameViewProps = {
  view: t.View;
  width?: string;
  height?: string;
};

const DESKTOP_WIDTH = 800;

const RenderFrameView = (props: RenderFrameViewProps) => {
  const editor = useEditor();

  const containerDomRef = React.useRef<HTMLDivElement | null>(null);
  const frameDomRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const { current: containerDom } = containerDomRef;
    const { current: frameDom } = frameDomRef;

    if (!frameDom || !containerDom) {
      return;
    }

    const scale = () => {
      if (containerDom.clientWidth < DESKTOP_WIDTH) {
        const scale = containerDom.clientWidth / DESKTOP_WIDTH;

        // get availabe height between the parent container and the newly scaled height
        const availableHeight =
          containerDom.clientHeight - containerDom.clientHeight * scale;
        const minHeight = availableHeight / scale + containerDom.clientHeight;

        frameDom.style.transform = `scale(${scale})`;
        frameDom.style.width = `${DESKTOP_WIDTH}px`;
        frameDom.style.minWidth = `${DESKTOP_WIDTH}px`;
        frameDom.style.maxWidth = `${DESKTOP_WIDTH}px`;
        frameDom.style.minHeight = `${minHeight}px`;
      } else {
        frameDom.removeAttribute('style');
      }
    };

    scale();

    const observer = new ResizeObserver(() => {
      scale();
    });

    observer.observe(containerDom);

    return () => {
      observer.unobserve(containerDom);
    };
  }, [props.width]);

  return (
    <Box css={{ width: '100%', height: '100%' }} ref={containerDomRef}>
      <StyledFrameContainer
        ref={frameDomRef}
        isNotFullWidth={isNotFullWidth(props.width, props.height)}
        css={{
          '> iframe': {
            maxWidth: props.width,
            maxHeight: props.height,
          },
        }}
      >
        <IFrame
          initialContent='<!DOCTYPE html><html><head><link href="/frame.css" rel="stylesheet" /></head><body><div id="root"></div></body></html>'
          mountTarget="#root"
          ref={(dom: any) => {
            editor.registerIframe(dom);
          }}
        >
          <Renderer key={props.view.id} view={props.view} />
        </IFrame>
        <RenderSelectionBorders />
      </StyledFrameContainer>
    </Box>
  );
};

type RenderFrameProps = {
  frame: ActiveFrame;
  width?: string;
  height?: string;
};

export const RenderFrame = observer((props: RenderFrameProps) => {
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
        <FrameContext.Provider value={props.frame.state}>
          <RenderFrameView
            width={props.width}
            height={props.height}
            view={props.frame.state.view}
          />
        </FrameContext.Provider>
      )}
    </React.Fragment>
  );
});
