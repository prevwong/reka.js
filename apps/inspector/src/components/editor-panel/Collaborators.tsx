import { useEditor } from '@app/editor';
import { styled } from '@app/stitches.config';
import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { Tooltip } from '../tooltip';
import { AnimatePresence, motion } from 'framer-motion';

const StyledCollaboratorsContainers = styled('div', {
  ml: '$2',
  display: 'flex',
});

const StyledUserIcon = styled(motion.span, {
  width: '25px',
  height: '25px',
  backgroundColor: 'transparent',
  borderRadius: '100%',
  fontSize: '0.6rem',
  color: '#fff',
  fontWeight: '600',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
  border: '1px solid transparent',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: ' ',
    display: 'block',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.2)',
  },
  '> b': {
    fontWeight: 500,
    position: 'relative',
    color: '#fff',
  },
  variants: {
    active: {
      true: {
        borderColor: '#09f',
        boxShadow: '0px 3px 11px -5px #00ecb9',
      },
    },
    disconnected: {
      true: {
        opacity: 0.3,
      },
    },
  },
});

const getInitials = (name: string) => {
  const [first, last] = name.split(' ');
  return first[0] + last[0];
};

const CollabUser = React.forwardRef<any, any>(
  ({ active, user, disconnected }, ref) => {
    return (
      <Tooltip content={user.name}>
        <StyledUserIcon
          active={active}
          css={{ backgroundColor: user.color }}
          disconnected={disconnected}
          ref={ref}
        >
          <b>{getInitials(user.name)}</b>
        </StyledUserIcon>
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
        {editor.allUsers.map((user, i) => (
          <MotionCollabUser
            key={i}
            user={user}
            active={user.id === editor.user.id}
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
        ))}
      </AnimatePresence>
    </StyledCollaboratorsContainers>
  );
});
