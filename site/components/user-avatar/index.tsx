import { motion } from 'framer-motion';
import * as React from 'react';

import { useEditor } from '@app/editor';
import { User } from '@app/editor/Editor';
import { cn } from '@app/utils';

const getInitials = (name: string) => {
  const [first, last] = name.split(' ');
  return first[0] + last[0];
};

type UserAvatarProps = {
  user: User;
};

export const UserAvatar = React.forwardRef<HTMLSpanElement, UserAvatarProps>(
  (props, ref) => {
    const editor = useEditor();

    const isActive = editor.user.id === props.user.id;
    return (
      <motion.span
        className={cn(
          'w-7 h-7 bg-transparent rounded-full text-[0.6rem] text-white font-medium flex flex-col justify-center text-center border border-solid border-transparent relative cursor-pointer',
          {
            'border-secondary-400 shadow-md shadow-secondary/20': isActive,
          }
        )}
        style={{ backgroundColor: props.user.color }}
        ref={ref}
      >
        <div className="absolute left-0 top-0 w-full h-full bg-black/20 rounded-full" />
        <b className="relative z-1 font-medium relative text-white">
          {getInitials(props.user.name)}
        </b>
      </motion.span>
    );
  }
);
