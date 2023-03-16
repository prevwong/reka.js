import * as t from '@rekajs/types';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import IFrame from 'react-frame-component';
import { ThreeDots } from 'react-loader-spinner';

import { useEditor, useEditorActiveComponent } from '@app/editor';
import { ActiveFrame } from '@app/editor/ComponentEditor';
import { cn } from '@app/utils';

import { FrameContext } from './FrameContext';
import { RenderSelectionBorders } from './RenderSelectionBorders';
import { Renderer } from './Renderer';

import { TemplateComments } from '../editor-layout/TemplateComments';

const isNotFullWidth = (
  width: number | string | undefined,
  height: number | string | undefined
) => {
  const isFullWidth = width === '100%' && height === '100%';
  const isUnset = !width && !height;

  const isNotFullWidth = !isFullWidth && !isUnset;

  return isNotFullWidth;
};

type RenderFrameViewProps = {
  view: t.View;
  width?: string;
  height?: string;
};

const DESKTOP_WIDTH = 800;

const RenderFrameView = observer((props: RenderFrameViewProps) => {
  const editor = useEditor();
  const activeComponentEditor = useEditorActiveComponent();

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
    <div className="w-full h-full" ref={containerDomRef}>
      <div
        className={cn(
          'w-full h-full relative flex flex-col justify-center min-h-full max-h-full origin-[0px_0px]',
          {
            'p-4': !isNotFullWidth,
          }
        )}
        ref={frameDomRef}
      >
        <IFrame
          style={{
            maxWidth: props.width,
            maxHeight: props.height,
          }}
          className={cn(
            'block m-auto w-full h-full shadow-none border border-transparent rounded-none bg-white',
            {
              'border-outline rounded-xs': !isNotFullWidth,
            }
          )}
          initialContent='<!DOCTYPE html><html><head><link href="/frame.css" rel="stylesheet" /></head><body><div id="root"></div></body></html>'
          mountTarget="#root"
          ref={(dom: any) => {
            editor.registerIframe(dom);
          }}
        >
          <Renderer key={props.view.id} view={props.view} />
        </IFrame>
        <RenderSelectionBorders />

        {activeComponentEditor.activeFrame?.templateToShowComments && (
          <TemplateComments activeFrame={activeComponentEditor.activeFrame} />
        )}
      </div>
    </div>
  );
});

type RenderFrameProps = {
  frame: ActiveFrame;
  width?: string;
  height?: string;
};

export const RenderFrame = observer((props: RenderFrameProps) => {
  React.useEffect(() => {
    window.requestAnimationFrame(() => {
      props.frame.state.enableSync();
    });
  }, [props.frame]);

  return (
    <React.Fragment>
      {!props.frame.state.view ? (
        <div className="absolute left-0 w-full h-full flex flex-col justify-center items-center bg-white">
          <ThreeDots
            height="50"
            width="50"
            color="#4563df"
            radius="3"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
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
