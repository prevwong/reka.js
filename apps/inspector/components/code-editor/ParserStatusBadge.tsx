import { styled } from '@app/styles';
import { CheckIcon, Cross1Icon, UpdateIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import * as React from 'react';
import { Tooltip } from '../tooltip';

const MotionUpdateIcon = motion(UpdateIcon);

type ParsingStatus = {
  type: 'parsing';
};

type ErrorStatus = {
  type: 'error';
  error: string;
};

type SuccessStatus = {
  type: 'success';
};

export type ParserStatus = ParsingStatus | ErrorStatus | SuccessStatus;

type ParserStatusBadgeProps = {
  status: ParserStatus;
};

const StyledBadge = styled(motion.span, {
  display: 'flex',
  alignItems: 'center',
  px: '$2',
  py: '$1',
  borderRadius: '100px',
  border: '1px solid #ccc',
  fontSize: '10px',
  fontWeight: '500',
  svg: {
    display: 'inline-block',
    mr: '$1',
    width: '12px',
    height: '12px',
  },
  variants: {
    type: {
      success: {
        color: '$green10',
        borderColor: '$green10',
      },
      error: {
        color: '$red10',
        borderColor: '$red10',
      },
      parsing: {},
    },
  },
});

export const ParserStatusBadge = (props: ParserStatusBadgeProps) => {
  const payload = React.useMemo(() => {
    switch (props.status.type) {
      case 'error':
        return {
          icon: <Cross1Icon />,
          message: 'Error',
          content: props.status.error,
        };
      case 'success':
        return {
          icon: <CheckIcon style={{ width: '15px', height: '15px' }} />,
          message: 'OK',
          content: 'All good',
        };
      case 'parsing':
        return {
          icon: (
            <MotionUpdateIcon
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
      <StyledBadge type={props.status.type}>
        {payload.icon}
        {payload.message}
      </StyledBadge>
    </Tooltip>
  );
};
