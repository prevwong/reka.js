import { motion } from 'framer-motion';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { styled } from '@app/styles';

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
  },
});

const getInitials = (name: string) => {
  const [first, last] = name.split(' ');
  return first[0] + last[0];
};

type UserAvatarProps = {
  userId: string;
};

export const UserAvatar = React.forwardRef<HTMLSpanElement, UserAvatarProps>(
  (props, ref) => {
    const editor = useEditor();

    const user = editor.getUserById(props.userId);

    if (!user) {
      return null;
    }

    return (
      <StyledUserIcon
        active={user.id === editor.user.id}
        css={{ backgroundColor: user.color }}
        ref={ref}
      >
        <b>{getInitials(user.name)}</b>
      </StyledUserIcon>
    );
  }
);
