import * as t from '@composite/types';
import * as React from 'react';

type ComponentContextType = {
  component: t.Component;
  parent?: t.Component;
};

export const ComponentContext = React.createContext<ComponentContextType>(
  null as any
);
