import { StateOpts } from '@composite/state';

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
    values: {
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
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
        },
      ],
      ...(config.externals?.values ?? {}),
    },
  },
});
