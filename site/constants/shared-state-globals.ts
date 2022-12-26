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
        name: "I'm now a monk",
        description: 'Life changing quote goes here',
      },
      {
        name: 'Hello World',
        description: 'Inspirational quote goes here',
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
