import { Cross2Icon } from '@radix-ui/react-icons';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import React from 'react';

import { styled } from '@app/styles';

type PopoverProps = {
  trigger: React.ReactNode;
  children?: React.ReactNode;
};

const PopoverArrow = styled(PopoverPrimitive.Arrow, {
  fill: 'white',
});

const PopoverClose = styled(PopoverPrimitive.Close, {
  fontFamily: 'inherit',
  height: '20px',
  width: '20px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '$blackA8',
  position: 'absolute',
  top: '5px',
  right: '5px',
  '&:hover': {
    color: '$blackA12',
  },
});

const PopoverContent = styled(PopoverPrimitive.Content, {
  borderRadius: '4px',
  padding: '$4 $4',
  width: '260px',
  backgroundColor: 'rgba(255,255,255,0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow:
    'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  animationDuration: '400ms',
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  willChange: 'transform, opacity',
  zIndex: '$max',
});

export const Popover = (props: PopoverProps) => (
  <PopoverPrimitive.Root>
    <PopoverPrimitive.Trigger asChild>{props.trigger}</PopoverPrimitive.Trigger>
    <PopoverPrimitive.Portal>
      <PopoverContent sideOffset={5}>
        {props.children}
        <PopoverClose aria-label="Close">
          <Cross2Icon width={12} height={12} />
        </PopoverClose>
        <PopoverArrow />
      </PopoverContent>
    </PopoverPrimitive.Portal>
  </PopoverPrimitive.Root>
);
