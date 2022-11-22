import * as React from 'react';

import { CompositeStateContext } from '../CompositeStateContext';
import { Query } from '@composite/state';

type Collector<C extends any> = (query: Query) => C;

export const useCollector = <C extends Record<string, any>>(
  collector: Collector<C>,
  deps?: any[]
) => {
  const state = React.useContext(CompositeStateContext);
  const collectorRef = React.useRef(collector);
  collectorRef.current = collector;

  const [collected, setCollected] = React.useState<C>(
    collectorRef.current(state.query)
  );

  React.useEffect(() => {
    return state.subscribe(
      () => collectorRef.current(state.query),
      (collected) => {
        return setCollected(collected);
      },
      {
        fireImmediately: true,
      }
    );
  }, [state, ...(deps || [])]);

  return {
    state,
    ...collected,
  };
};
