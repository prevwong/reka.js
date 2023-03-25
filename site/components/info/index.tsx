import { InfoCircledIcon } from '@radix-ui/react-icons';
import * as React from 'react';

import { Tooltip } from '../tooltip';

type InfoProps = {
  info: string;
};

export const Info = (props: InfoProps) => {
  return (
    <Tooltip content={props.info}>
      <div className="cursor-pointer ml-2 text-slate-600">
        <InfoCircledIcon width={13} height={13} />
      </div>
    </Tooltip>
  );
};
