import * as React from 'react';

import { CompositeStateContext } from '../CompositeStateContext';
import { Query } from '@composite/state';

type Collector<C extends any> = (query: Query) => C;

export const useCollector = <C extends Record<string, any>>(
  collector: Collector<C>
) => {
  const state = React.useContext(CompositeStateContext);
  const collectorRef = React.useRef(collector);

  const [collected, setCollected] = React.useState<C>(
    collectorRef.current(state.query)
  );

  React.useEffect(() => {
    return state.subscribe(
      () => collectorRef.current(state.query),
      (collected) => setCollected(collected),
      {
        fireImmediately: true,
      }
    );
  }, [state]);

  return {
    state,
    ...collected,
  };
};
