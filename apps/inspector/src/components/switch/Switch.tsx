import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

import { styled } from '@app/stitches.config';

const StyledSwitch = styled(SwitchPrimitive.Root, {
  width: '42px',
  height: '20px',
  borderRadius: '100px',
  position: 'relative',
  backgroundColor: '$blackA6',
  '&[data-state="checked"]': {
    background: '$blackA9',
  },
});

const StyledThumb = styled(SwitchPrimitive.Thumb, {
  width: '16px',
  height: '16px',
  display: 'block',
  borderRadius: '$round',
  transform: 'translateX(2px)',
  transition: 'transform 100ms',
  background: '$whiteA6',
  '&[data-state="checked"]': {
    transform: 'translateX(24px)',
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
