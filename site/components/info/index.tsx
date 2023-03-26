import { InfoCircledIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { cn } from '@app/utils';

import { Tooltip } from '../tooltip';

type InfoProps = {
  info: string;
  className?: string;
};

export const Info = (props: InfoProps) => {
  return (
    <Tooltip content={props.info}>
      <div className={cn('cursor-pointer ml-2 text-inherit', props.className)}>
        <InfoCircledIcon width={13} height={13} />
      </div>
    </Tooltip>
  );
};
