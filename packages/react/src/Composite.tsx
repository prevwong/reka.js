import * as React from 'react';
import { State } from '@composite/state';

import { CompositeStateContext } from './CompositeStateContext';

type CompositeProps = {
  state: State;
  children?: React.ReactNode;
};

export const Composite = (props: CompositeProps) => {
  return (
    <CompositeStateContext.Provider value={props.state}>
      {props.children}
    </CompositeStateContext.Provider>
  );
};
