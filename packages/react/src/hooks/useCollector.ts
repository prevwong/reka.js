import * as React from 'react';
import * as t from '@composite/types';

import { CompositeStateContext } from '../CompositeStateContext';

type Collector<C extends any> = (state: t.State) => C;

export const useCollector = <C extends any>(collector: Collector<C>) => {
  const state = React.useContext(CompositeStateContext);
  const collectorRef = React.useRef(collector);

  const [collected, setCollected] = React.useState<C>(
    collectorRef.current(state.data)
  );

  React.useEffect(() => {
    return state.subscribe(
      (state) => collectorRef.current(state),
      (collected) => setCollected(collected),
      {
        fireImmediately: true,
      }
    );
  }, [state]);

  return collected;
};
