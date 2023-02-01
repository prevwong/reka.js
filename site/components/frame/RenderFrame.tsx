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
import { styled } from '@app/styles';

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

type RenderFrameProps = {
  frame: ActiveFrame;
  width?: string;
  height?: string;
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
          <StyledFrameContainer
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
              <FrameContext.Provider value={props.frame.state}>
                <Renderer
                  key={props.frame.state.view.id}
                  view={props.frame.state.view}
                />
              </FrameContext.Provider>
            </IFrame>

            <RenderSelectionBorders />
          </StyledFrameContainer>
        </React.Fragment>
      )}
    </React.Fragment>
  );
});
