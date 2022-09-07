import { createExtension } from '@composite/state';
import * as t from '@composite/types';

export type UserFrame = {
  id: string;
  name: string;
  props?: Record<string, any>;
};

export type UserFrameExtensionState = {
  frames: UserFrame[];
};

export const UserFrameExtension = createExtension<UserFrameExtensionState>({
  state: {
    frames: [
      { id: 'App', name: 'App' },
      {
        id: 'Button Primary',
        name: 'Button',
        props: { text: t.literal({ value: 'Hello' }) },
      },
      {
        id: 'Button Secondary',
        name: 'Button',
        props: { text: t.literal({ value: 'Woah' }) },
      },
      {
        id: 'Button Tertiary',
        name: 'Button',
        props: { text: t.literal({ value: 'Woah' }) },
      },
      {
        id: 'Button Warning',
        name: 'Button',
        props: { text: t.literal({ value: 'Woah' }) },
      },
    ],
  },
  globals: {},
  components: [],
});
