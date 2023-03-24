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
    <div className="ml-2 flex gap-1">
      <AnimatePresence initial={false}>
        {editor.peers.map((user) => (
          <MotionCollabUser
            key={user.id}
            user={user}
            active={false}
            layout
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={CREATE_BEZIER_TRANSITION({ duration: 0.2 })}
          />
        ))}
        <MotionCollabUser
          user={editor.user}
          active={true}
          layout
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={CREATE_BEZIER_TRANSITION({ duration: 0.2 })}
        />
      </AnimatePresence>
    </div>
  );
});
