import { Composite } from '@composite/state';
import * as React from 'react';

import { CompositeStateContext } from '../CompositeStateContext';

type Collector<C extends Record<string, any>> = (composite: Composite) => C;

export const useCollector = <C extends Record<string, any>>(
  collector: Collector<C>,
  deps?: any[]
) => {
  const composite = React.useContext(CompositeStateContext);
  const collectorRef = React.useRef(collector);
  collectorRef.current = collector;

  const [collected, setCollected] = React.useState<C>(
    collectorRef.current(composite)
  );

  React.useEffect(() => {
    return composite.subscribe(
      (self) => collectorRef.current(self),
      (collected) => {
        return setCollected(collected);
      },
      {
        fireImmediately: true,
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composite, ...(deps || [])]);

  return {
    state: composite,
    ...collected,
  };
};
