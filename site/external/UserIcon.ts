import * as React from 'react';

const loadIcon = async () => {
  const icons = await require('@radix-ui/react-icons');
  return icons;
};

type UserIconProps = {
  name: string;
};

export const UserIcon = (props: UserIconProps) => {
  const [icon, setIcon] = React.useState(null);

  React.useEffect(() => {
    loadIcon().then((res) => {
      if (!res[props.name]) {
        return;
      }

      setIcon(res[props.name]);
    });
  }, [props.name]);

  if (!icon) {
    return null;
  }

  return React.createElement(icon);
};
