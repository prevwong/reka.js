import * as React from 'react';

type MobileFallbackProps = {
  size?: number;
  render: React.ReactNode;
  fallback?: React.ReactNode;
};

export const MobileFallback = (props: MobileFallbackProps) => {
  const size = React.useMemo(() => props.size || 1100, [props.size]);

  const [width, setWidth] = React.useState(size + 1);

  React.useEffect(() => {
    const onResize = () => {
      setWidth(window.innerWidth);
    };

    onResize();

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [setWidth]);

  return (
    <React.Fragment>
      {width > size ? props.render : props.fallback || null}
    </React.Fragment>
  );
};
