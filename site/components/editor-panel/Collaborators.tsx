import { AnimatePresence, motion } from 'framer-motion';
import { observer } from 'mobx-react-lite';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { styled } from '@app/styles';

import { Tooltip } from '../tooltip';
import { UserAvatar } from '../user-avatar';

const StyledCollaboratorsContainers = styled('div', {
  ml: '$2',
  display: 'flex',
  gap: '2px',
});

const CollabUser = React.forwardRef<HTMLSpanElement, any>(
  ({ active, user }, ref) => {
    return (
      <Tooltip content={`${user.name}${active ? ' (You)' : ''}`}>
        <UserAvatar ref={ref} userId={user.id} />
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
    <StyledCollaboratorsContainers>
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
            transition={{
              ease: [0.19, 1, 0.22, 1],
              duration: 0.4,
            }}
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
          transition={{
            ease: [0.19, 1, 0.22, 1],
            duration: 0.4,
          }}
        />
      </AnimatePresence>
    </StyledCollaboratorsContainers>
  );
});
