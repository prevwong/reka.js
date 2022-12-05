import { UserFrameExtension } from '@app/extensions/UserFrameExtension';
import { UserHeader } from '@app/external/UserHeader';
import { UserIcon } from '@app/external/UserIcon';
import * as t from '@composite/types';

export const STATE_CONFIG = {
  components: [
    t.externalComponent({
      name: 'Header',
      render: () => {
        return <UserHeader />;
      },
    }),
    t.externalComponent({
      name: 'Icon',
      render: (props: { name: string }) => {
        return <UserIcon name={props.name} />;
      },
    }),
  ],
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
  },
  extensions: [UserFrameExtension],
};
