import { InfoCircledIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { Box } from '../box';
import { Tooltip } from '../tooltip';

type InfoProps = {
  info: string;
};

export const Info = (props: InfoProps) => {
  return (
    <Tooltip content={props.info}>
      <Box css={{ ml: '$2', opacity: '0.7' }}>
        <InfoCircledIcon width={12} height={12} />
      </Box>
    </Tooltip>
  );
};
