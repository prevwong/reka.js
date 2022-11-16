import { createExtension } from '@composite/state';
import * as t from '@composite/types';

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

export const UserFrameExtensionFactory = () =>
  createExtension<UserFrameExtensionState>({
    state: {
      frames: [
        { id: 'Main App', name: 'App', width: '100%', height: '100%' },
        {
          id: 'Card',
          name: 'Card',
          props: {
            name: t.literal({ value: 'Dummy Card' }),
            description: t.literal({ value: 'Dummy description for card' }),
          },
          width: '600px',
          height: '542px',
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
      ],
    },
    globals: {},
    components: [],
    hooks: {
      onCreate: (state, pluginState) => {
        pluginState.frames.forEach((frame) => {
          state.createFrame({
            id: frame.id,
            component: {
              name: frame.name,
              props: frame.props,
            },
          });
        });
      },
      onStateChange: (state, _pluginState, change) => {
        const isUserFrameUpdatePath =
          change.path.length === 2 &&
          change.path[0].key === 'frames' &&
          typeof change.path[1].key === 'number';

        if (!isUserFrameUpdatePath) {
          return;
        }

        const userFrameUpdated = change.object;

        const stateFrame = state.frames.find(
          (frame) => frame.id === userFrameUpdated.id
        );

        if (!stateFrame) {
          return;
        }

        stateFrame.updateProps(userFrameUpdated.props);
        console.log('update', userFrameUpdated, stateFrame);
      },
    },
  });

export const UserFrameExtension = UserFrameExtensionFactory();
