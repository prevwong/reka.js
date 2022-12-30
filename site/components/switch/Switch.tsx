import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as React from 'react';

import { styled } from '@app/styles';

const StyledSwitch = styled(SwitchPrimitive.Root, {
  width: '38px',
  height: '20px',
  borderRadius: '100px',
  position: 'relative',
  backgroundColor: '$blackA6',
  cursor: 'pointer',
  '&[data-state="checked"]': {
    background: '$primary',
  },
});

const StyledThumb = styled(SwitchPrimitive.Thumb, {
  width: '14px',
  height: '14px',
  display: 'block',
  borderRadius: '$round',
  transform: 'translateX(2px)',
  transition: 'transform 100ms',
  background: '$whiteA12',
  '&[data-state="checked"]': {
    transform: 'translateX(22px)',
    background: '$whiteA12',
  },
});

type SwitchProps = {
  className?: string;
  checked: boolean;
  onChange: () => void;
};

export const Switch = (props: SwitchProps) => {
  return (
    <StyledSwitch
      className={props.className}
      checked={props.checked}
      onCheckedChange={() => props.onChange()}
    >
      <StyledThumb />
    </StyledSwitch>
  );
};
