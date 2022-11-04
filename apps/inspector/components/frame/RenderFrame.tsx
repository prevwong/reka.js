import * as React from 'react';
import { Frame as CompositeFrame } from '@composite/state';
import IFrame from 'react-frame-component';
import { observer } from 'mobx-react-lite';
import { Renderer } from './Renderer';
import { FrameContext } from './FrameContext';

type RenderFrameProps = {
  frame: CompositeFrame;
};

export const RenderFrame = observer((props: RenderFrameProps) => {
  return (
    <IFrame
      initialContent='<!DOCTYPE html><html><head><link href="/tailwind.css" rel="stylesheet" /><link href="/frame.css" rel="stylesheet" /></head><body><div id="root"></div></body></html>'
      mountTarget="#root"
      style={{ width: '100%', height: '100%' }}
    >
      <FrameContext.Provider value={props.frame}>
        {props.frame.root && (
          <Renderer key={props.frame.root.id} view={props.frame.root} />
        )}
      </FrameContext.Provider>
    </IFrame>
  );
});
