import { StateOpts } from '@composite/state';

import { CommentExtension } from '@app/extensions/CommentExtension';
import { UserFrameExtension } from '@app/extensions/UserFrameExtension';

export const createSharedStateGlobals = (
  config: Omit<Partial<StateOpts>, 'components'> = {}
) => ({
  globals: {
    myString: 'Hello from External Variable',
    posts: [
      {
        name: 'Interesting Post',
        description:
          'Ut enim ad minim veniam, quis nostrud exercitation ullamco',
      },
      {
        name: 'Hello World',
        image: '/images/pawel-olek-1.png',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      },
    ],
    ...(config.globals || {}),
  },
  extensions: [
    ...(config.extensions || []),
    UserFrameExtension,
    CommentExtension,
  ],
});
