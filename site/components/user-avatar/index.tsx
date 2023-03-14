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

    return (
      <motion.span
        className={cn(
          'w-7 h-7 bg-transparent rounded-full text-[0.6rem] text-white font-medium flex flex-col justify-center text-center border border-solid border-transparent relative cursor-pointer',
          {
            'border-blue-500 shadow-lg': props.user.id === editor.user.id,
          }
        )}
        style={{ backgroundColor: props.user.color }}
        ref={ref}
      >
        <b className="font-medium relative text-white">
          {getInitials(props.user.name)}
        </b>
      </motion.span>
    );
  }
);
