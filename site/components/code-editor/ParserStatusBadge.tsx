import { CheckIcon, Cross1Icon, UpdateIcon } from '@radix-ui/react-icons';
import { ParserStatus } from '@rekajs/react-code-editor';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import * as React from 'react';

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
          icon: <CheckIcon style={{ width: '15px', height: '15px' }} />,
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
        className={classNames(
          'flex items-center px-2 py-0.5 rounded-full border border-solid border-outline text-xs [&>svg]:inline-block [&>svg]:mr-2 [&>svg]:w-5 [&>svg]:h-5',
          {
            'text-green-600 border-green-400': props.status.type === 'success',
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
