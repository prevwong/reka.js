import * as React from 'react';
import { Frame as CompositeFrame } from '@composite/state';
import IFrame from 'react-frame-component';
import { observer } from 'mobx-react-lite';
import { Renderer } from './Renderer';
import { FrameContext } from './FrameContext';
import { styled } from '@app/styles';
import { useEditor } from '@app/editor';

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
  '> iframe': {
    display: 'block',
    margin: '0 auto',
    width: '100%',
    height: '100%',
    boxShadow: 'none',
    border: '1px solid transparent',
    borderRadius: 0,
  },
  variants: {
    isNotFullWidth: {
      true: {
        padding: '$4',
        '> iframe': {
          boxShadow: 'rgb(0 0 0 / 9%) 0px 3px 12px',
          borderColor: 'rgb(0 0 0 / 7%)',
          borderRadius: '$1',
        },
      },
    },
  },
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
          width: props.width,
          height: props.height,
        }}
        ref={(dom: any) => {
          editor.settings.registerIframe(dom);
        }}
      >
        <FrameContext.Provider value={props.frame}>
          {props.frame.root && (
            <Renderer key={props.frame.root.id} view={props.frame.root} />
          )}
        </FrameContext.Provider>
      </IFrame>
    </StyledFrameContainer>
  );
});
