import { Composite } from '@composite/state';
import * as React from 'react';

import { CompositeStateContext } from './CompositeStateContext';

type CompositeProps = {
  state: Composite;
  children?: React.ReactNode;
};

export const CompositeProvider = (props: CompositeProps) => {
  return (
    <CompositeStateContext.Provider value={props.state}>
      {props.children}
    </CompositeStateContext.Provider>
  );
};
