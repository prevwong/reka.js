import { AnimatePresence, motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { CREATE_BEZIER_TRANSITION } from '@app/utils';

import { Tooltip } from '../tooltip';
import { UserAvatar } from '../user-avatar';

const CollabUser = React.forwardRef<HTMLSpanElement, any>(
  ({ active, user }, ref) => {
    return (
      <Tooltip content={`${user.name}${active ? ' (You)' : ''}`}>
        <UserAvatar ref={ref} user={user} />
      </Tooltip>
    );
  }
);

const MotionCollabUser = motion(CollabUser);

export const Collaborators = observer(() => {
  const editor = useEditor();

  if (editor.allUsers.length === 0) {
    return null;
  }

  return (
    <div className="ml-2 flex gap-1.5">
      <AnimatePresence>
        {editor.peers.map((user, i) => (
          <MotionCollabUser
            key={i}
            user={user}
            active={false}
            animate={{
              transform: 'scale(1)',
            }}
            exit={{ transform: 'scale(0)' }}
            transition={CREATE_BEZIER_TRANSITION()}
          />
        ))}
        <MotionCollabUser
          user={editor.user}
          active={true}
          disconnected={editor.connected === false}
          animate={{
            transform: 'scale(1)',
          }}
          exit={{ transform: 'scale(0)' }}
          transition={CREATE_BEZIER_TRANSITION()}
        />
      </AnimatePresence>
    </div>
  );
});
