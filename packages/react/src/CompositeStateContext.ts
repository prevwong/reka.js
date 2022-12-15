import { State } from '@composite/state';
import * as React from 'react';

export const CompositeStateContext = React.createContext<State>(null as any);
