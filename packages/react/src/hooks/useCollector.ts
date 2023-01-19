import { Reka } from '@rekajs/core';
import * as React from 'react';

import { RekaStateContext } from '../RekaStateContext';

type Collector<C extends Record<string, any>> = (reka: Reka) => C;

export const useCollector = <C extends Record<string, any>>(
  collector?: Collector<C>,
  deps?: any[]
) => {
  const reka = React.useContext(RekaStateContext);
  const collectorRef = React.useRef(collector);
  collectorRef.current = collector;

  const [collected, setCollected] = React.useState<C>(
    collectorRef.current?.(reka) ?? ({} as C)
  );

  React.useEffect(() => {
    const { current: collector } = collectorRef;

    if (!collector) {
      return;
    }

    return reka.subscribe(
      (self) => collector(self),
      (collected) => {
        return setCollected(collected);
      },
      {
        fireImmediately: true,
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reka, ...(deps || [])]);

  return {
    reka,
    ...collected,
  };
};
