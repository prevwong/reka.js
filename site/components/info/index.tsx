import { InfoCircledIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { Tooltip } from '../tooltip';

type InfoProps = {
  info: string;
};

export const Info = (props: InfoProps) => {
  return (
    <Tooltip content={props.info}>
      <div className="ml-2 opacity-70">
        <InfoCircledIcon width={12} height={12} />
      </div>
    </Tooltip>
  );
};
