import * as t from '@composite/types';

import { useCollector } from './useCollector';

type ProgramCollector<C extends any> = (program: t.Program) => C;

export const useProgram = <C extends any>(collector: ProgramCollector<C>) => {
  return useCollector((state) => collector(state.program));
};
