import * as t from '@composite/types';

import * as React from 'react';

type ViewContextType = {
  view: t.View;
  parent?: t.View;
};

export const ViewContext = React.createContext<ViewContextType>(null as any);
