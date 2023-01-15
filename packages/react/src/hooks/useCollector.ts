import { Composite } from '@composite/state';
import * as React from 'react';

import { CompositeStateContext } from '../CompositeStateContext';

type Collector<C extends Record<string, any>> = (composite: Composite) => C;

export const useCollector = <C extends Record<string, any>>(
  collector?: Collector<C>,
  deps?: any[]
) => {
  const composite = React.useContext(CompositeStateContext);
  const collectorRef = React.useRef(collector);
  collectorRef.current = collector;

  const [collected, setCollected] = React.useState<C>(
    collectorRef.current?.(composite) ?? ({} as C)
  );

  React.useEffect(() => {
    const { current: collector } = collectorRef;

    if (!collector) {
      return;
    }

    return composite.subscribe(
      (self) => collector(self),
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
    composite,
    ...collected,
  };
};
