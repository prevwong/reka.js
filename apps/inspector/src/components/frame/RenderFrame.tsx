import * as React from 'react';
import { Frame as CompositeFrame } from '@composite/state';
import { observer } from 'mobx-react-lite';
import { Renderer } from './Renderer';
import { FrameContext } from './FrameContext';

type RenderFrameProps = {
  frame: CompositeFrame;
};

export const RenderFrame = observer((props: RenderFrameProps) => {
  return (
    <FrameContext.Provider value={props.frame}>
      {props.frame.root && (
        <Renderer key={props.frame.root.id} view={props.frame.root} />
      )}
    </FrameContext.Provider>
  );
});
