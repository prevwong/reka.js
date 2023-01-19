import { Reka } from '@rekajs/core';
import * as React from 'react';

import { RekaStateContext } from './RekaStateContext';

type RekaProps = {
  state: Reka;
  children?: React.ReactNode;
};

export const RekaProvider = (props: RekaProps) => {
  return (
    <RekaStateContext.Provider value={props.state}>
      {props.children}
    </RekaStateContext.Provider>
  );
};
