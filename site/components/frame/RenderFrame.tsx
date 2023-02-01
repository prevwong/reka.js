import { observer } from 'mobx-react-lite';
import * as React from 'react';
import IFrame from 'react-frame-component';
import { ThreeDots } from 'react-loader-spinner';

import { useEditor } from '@app/editor';
import { ActiveFrame } from '@app/editor/ComponentEditor';

import { FrameContext } from './FrameContext';
import { RenderSelectionBorders } from './RenderSelectionBorders';
import { Renderer } from './Renderer';

import { Box } from '../box';

type RenderFrameProps = {
  frame: ActiveFrame;
};

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
