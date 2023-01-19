import { StateOpts } from '@rekajs/core';

import { CommentExtension } from '@app/extensions/CommentExtension';
import { UserFrameExtension } from '@app/extensions/UserFrameExtension';

export const createSharedStateGlobals = (
  config: Partial<StateOpts> = {}
): StateOpts => ({
  extensions: [
    ...(config.extensions || []),
    UserFrameExtension,
    CommentExtension,
  ],
  externals: {
    components: [...(config.externals?.components ?? [])],
    states: {
      myString: 'Hello from External Variable',
      posts: [
        {
          name: 'Interesting Post',
          image: '/images/pawel-olek-1.png',
          description:
            'Ut enim ad minim veniam, quis nostrud exercitation ullamco',
        },
        {
          name: 'Hello World',
          image: '/images/pawel-olek-2.png',
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
        },
      ],
      ...(config.externals?.states ?? {}),
    },
    globals: config.externals?.globals,
  },
});
