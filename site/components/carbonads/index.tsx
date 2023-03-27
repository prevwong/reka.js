import { cn } from '@app/utils';
import * as React from 'react';

type CarbonadsProps = {
  className?: string;
};
export const Carbonads = (props: CarbonadsProps) => {
  const domRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const { current: dom } = domRef;

    if (!dom) {
      return;
    }

    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('async', 'true');

    script.setAttribute(
      'src',
      '//cdn.carbonads.com/carbon.js?serve=CWYDVK7J&placement=rekajsorg'
    );
    script.setAttribute('id', '_carbonads_js');
    script.onload = () => {
      console.log('loaded');
    };

    dom.appendChild(script);

    return () => {
      dom.removeChild(script);
    };
  }, []);

  return (
    <div
      className={cn(
        'carbonads-container carbonads-container-sidebar',
        props.className
      )}
      ref={domRef}
    />
  );
};
