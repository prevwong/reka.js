import * as React from 'react';
import ReactDOM from 'react-dom';

import { SITE_LAYOUT_HEADER_TOOLBAR_CLASSNAME } from '@app/constants/css';

type HeaderToolbarProps = {
  children?: React.ReactNode;
};

export const HeaderToolbar = (props: HeaderToolbarProps) => {
  const elRef = React.useRef<HTMLDivElement | null>(null);

  if (typeof window !== 'undefined' && !elRef.current) {
    elRef.current = document.querySelector(
      `.${SITE_LAYOUT_HEADER_TOOLBAR_CLASSNAME}`
    );
  }

  if (!elRef.current) {
    return null;
  }

  return ReactDOM.createPortal(props.children, elRef.current);
};
