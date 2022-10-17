import * as React from 'react';
import { State } from '@composite/state';

export const CompositeStateContext = React.createContext<State>(null as any);
