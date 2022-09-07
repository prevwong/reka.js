import * as t from '@composite/types';

import * as React from 'react';

import { ViewContext } from './ViewContext';

type ViewProps = {
  view: t.View;
  children?: React.ReactNode;
};

export const View = (props: ViewProps) => {
  const parent = React.useContext(ViewContext);

  return (
    <ViewContext.Provider value={{ view: props.view, parent: parent?.view }}>
      {props.children}
    </ViewContext.Provider>
  );
};
