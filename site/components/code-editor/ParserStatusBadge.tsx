import { CheckIcon, Cross1Icon, UpdateIcon } from '@radix-ui/react-icons';
import { ParserStatus } from '@rekajs/react-code-editor';
import { motion } from 'framer-motion';
import * as React from 'react';

import { cn } from '@app/utils';

import { Tooltip } from '../tooltip';

const MotionUpdateIcon = motion(UpdateIcon);

type ParserStatusBadgeProps = {
  status: ParserStatus;
};

export const ParserStatusBadge = (props: ParserStatusBadgeProps) => {
  const payload = React.useMemo(() => {
    switch (props.status.type) {
      case 'error':
        return {
          icon: <Cross1Icon style={{ width: '12px', height: '12px' }} />,
          message: 'Error',
          content: props.status.error,
        };
      case 'success':
        return {
          icon: (
            <CheckIcon
              className="!mr-0.5"
              style={{ width: '15px', height: '15px' }}
            />
          ),
          message: 'OK',
          content: 'Parsed without errors',
        };
      case 'parsing':
        return {
          icon: (
            <MotionUpdateIcon
              style={{ width: '10px', height: '10px' }}
              animate={{ rotate: 180 }}
              transition={{ repeat: Infinity, duration: 0.2 }}
            />
          ),
          message: 'Parsing',
          content: 'Parsing',
        };
    }
  }, [props.status]);

  return (
    <Tooltip content={payload.content}>
      <div
        className={cn(
          'flex items-center px-1.5 py-0.5 rounded-full border border-solid border-outline text-xs [&>svg]:inline-block [&>svg]:mr-2 [&>svg]:w-5 [&>svg]:h-5',
          {
            'text-green-600 border-green-600': props.status.type === 'success',
            'text-red-600 border-red-400': props.status.type === 'error',
          }
        )}
      >
        {payload.icon}
        {payload.message}
      </div>
    </Tooltip>
  );
};
