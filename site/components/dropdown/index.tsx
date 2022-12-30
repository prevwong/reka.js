import { mauve } from '@radix-ui/colors';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as React from 'react';

import { styled } from '@app/styles';

const StyledContent = styled(DropdownMenuPrimitive.Content, {
  minWidth: '140px',
  backgroundColor: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(10px)',
  borderRadius: '$1',
  border: '1px solid $grayA2',
  boxShadow: '0px 3px 22px -8px rgb(0 0 0 / 50%)',
  '@media (prefers-reduced-motion: no-preference)': {
    animationDuration: '400ms',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    willChange: 'transform, opacity',
  },
});

const StyledArrow = styled(DropdownMenuPrimitive.Arrow, {
  fill: 'white',
});

const StyledItem = styled(DropdownMenuPrimitive.Item, {
  all: 'unset',
  fontSize: 10,
  lineHeight: 1,
  color: '$grayA12',
  borderRadius: 0,
  display: 'flex',
  alignItems: 'center',
  padding: '$3 $2',
  position: 'relative',
  userSelect: 'none',
  cursor: 'pointer',

  '&[data-disabled]': {
    color: mauve.mauve8,
    pointerEvents: 'none',
  },

  '&[data-highlighted]': {
    backgroundColor: '$grayA2',
  },
});

type DropdownItem = {
  title: string;
  onSelect: () => void;
};

type DropdownProps = {
  items: DropdownItem[];
  children: React.ReactNode;
};

export const Dropdown = (props: DropdownProps) => {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        {props.children}
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <StyledContent {...props}>
          {props.items.map((item) => (
            <StyledItem
              key={item.title}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onSelect={(e) => {
                e.stopPropagation();
                e.preventDefault();

                item.onSelect();
              }}
            >
              {item.title}
            </StyledItem>
          ))}
          <StyledArrow />
        </StyledContent>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
};
