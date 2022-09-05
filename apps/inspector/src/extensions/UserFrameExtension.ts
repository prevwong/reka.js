import { createExtension } from '@composite/state';

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
      { id: 'root', name: 'App' },
      // { id: "button-main", name: "Button", props: { text: t.literal({value: "Hello"}) } },
    ],
  },
  globals: {},
  components: [],
});
