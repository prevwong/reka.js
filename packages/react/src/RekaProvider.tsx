import { Reka } from '@rekajs/core';
import * as React from 'react';

import { RekaStateContext } from './RekaStateContext';

type RekaProps = {
  reka: Reka;
  children?: React.ReactNode;
};

export const RekaProvider = (props: RekaProps) => {
  return (
    <RekaStateContext.Provider value={props.reka}>
      {props.children}
    </RekaStateContext.Provider>
  );
};
