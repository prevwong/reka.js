import { createExtension } from '@rekajs/core';
import * as t from '@rekajs/types';

export type UserFrame = {
  id: string;
  name: string;
  props?: Record<string, any>;
  width?: string;
  height?: string;
};

export type UserFrameExtensionState = {
  frames: UserFrame[];
};

export const UserFrameExtensionFactory = () => {
  return createExtension<UserFrameExtensionState>({
    key: 'user-frame-extension',
    state: {
      frames: [
        { id: 'Main App', name: 'App', width: '100%', height: '100%' },
        {
          id: 'Test Feature',
          name: 'Feature',
          props: {
            title: t.literal({ value: 'Test Feature' }),
            description: t.literal({
              value: 'An interesting feature description',
            }),
            children: t.tagTemplate({
              tag: 'text',
              props: {
                value: t.literal({ value: 'Some child text' }),
              },
              children: [],
            }),
          },
        },
        { id: 'Top Header', name: 'Header' },
        {
          id: 'Basic Card',
          name: 'Card',
          props: {
            name: t.literal({ value: 'Dummy Card' }),
            description: t.literal({ value: 'Dummy description for card' }),
          },
          width: '600px',
          height: '542px',
        },
        {
          id: 'Demo Modal',
          name: 'Modal',
          props: {
            title: t.literal({ value: 'My Modal' }),
            isOpen: t.literal({ value: true }),
            children: t.tagTemplate({
              tag: 'text',
              props: {
                value: t.literal({ value: 'Hello from Modal' }),
              },
              children: [],
            }),
          },
        },
        {
          id: 'Primary Button',
          name: 'Button',
          props: {
            text: t.literal({ value: 'Click me' }),
          },
          width: '300px',
          height: '300px',
        },
        {
          id: 'Button with Icon',
          name: 'Button',
          props: {
            text: t.literal({ value: 'Icon' }),
            icon: t.literal({ value: 'ArrowRightIcon' }),
          },
          width: '300px',
          height: '300px',
        },
        {
          id: 'Basic text input',
          name: 'Input',
          props: {
            text: t.literal({ value: 'Hello!' }),
          },
        },
        {
          id: 'Prop Binding Demo',
          name: 'PropBinding',
          props: {},
        },
      ],
    },
    init: (ext) => {
      ext.subscribe(
        (state) => {
          return {
            frameProps: state.frames.reduce<
              Record<string, Record<string, any>>
            >(
              (accum, frame) => ({
                ...accum,
                [frame.id]: frame.props ?? {},
              }),
              {}
            ),
          };
        },
        (collected) => {
          Object.keys(collected.frameProps).forEach((key) => {
            const props = collected.frameProps[key];

            const stateFrame = ext.reka.frames.find(
              (frame) => frame.id === key
            );

            if (!stateFrame) {
              return;
            }

            stateFrame.setProps(props);
          });
        }
      );

      ext.subscribe(
        (state) => {
          return {
            frameCount: state.frames.length,
            frames: state.frames,
          };
        },
        (state, prevState) => {
          const currentFrames = state.frames;

          currentFrames.forEach((currentFrame) => {
            const stateFrame = ext.reka.frames.find(
              (frame) => frame.id === currentFrame.id
            );

            if (stateFrame) {
              return;
            }

            ext.reka.createFrame({
              id: currentFrame.id,
              component: {
                name: currentFrame.name,
                props: currentFrame.props,
              },
              syncImmediately: false,
            });
          });

          if (!prevState) {
            return;
          }

          if (prevState.frames.length <= currentFrames.length) {
            return;
          }

          const currentFrameIds = currentFrames.map((frame) => frame.id);
          const deletedFrames = prevState.frames.filter(
            (frame) => currentFrameIds.includes(frame.id) === false
          );

          deletedFrames.forEach((deletedFrame) => {
            const frame = ext.reka.frames.find(
              (frame) => frame.id === deletedFrame.id
            );

            if (!frame) {
              return;
            }

            ext.reka.removeFrame(frame);
          });
        },
        {
          fireImmediately: true,
        }
      );
    },
  });
};

export const UserFrameExtension = UserFrameExtensionFactory();
