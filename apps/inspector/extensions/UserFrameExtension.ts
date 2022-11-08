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

export const UserFrameExtension = createExtension<UserFrameExtensionState>({
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
      },
      {
        id: 'Primary Button',
        name: 'Button',
        props: {
          className: t.literal({ value: 'w-full' }),
          text: t.literal({ value: 'Click me' }),
        },
        width: '100px',
        height: '35px',
      },
      // {
      //   id: 'Button Tertiary',
      //   name: 'Button',
      //   props: { text: t.literal({ value: 'Woah' }) },
      // },
      // {
      //   id: 'Button Warning',
      //   name: 'Button',
      //   props: { text: t.literal({ value: 'Woah' }) },
      // },
    ],
  },
  globals: {},
  components: [],
});
