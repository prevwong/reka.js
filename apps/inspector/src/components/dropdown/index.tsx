import { styled } from '@app/stitches.config';
import { mauve, violet } from '@radix-ui/colors';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as React from 'react';

const StyledContent = styled(DropdownMenuPrimitive.Content, {
  minWidth: '140px',
  backgroundColor: 'white',
  borderRadius: '$1',
  boxShadow:
    '0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)',
  '@media (prefers-reduced-motion: no-preference)': {
    animationDuration: '400ms',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    willChange: 'transform, opacity',
    //   '&[data-state="open"]': {
    //     '&[data-side="top"]': { animationName: slideDownAndFade },
    //     '&[data-side="right"]': { animationName: slideLeftAndFade },
    //     '&[data-side="bottom"]': { animationName: slideUpAndFade },
    //     '&[data-side="left"]': { animationName: slideRightAndFade },
    //   },
  },
});

const StyledArrow = styled(DropdownMenuPrimitive.Arrow, {
  fill: 'white',
});

function Content({ children, ...props }) {
  return (
    <DropdownMenuPrimitive.Portal>
      <StyledContent {...props}>
        {children}
        <StyledArrow />
      </StyledContent>
    </DropdownMenuPrimitive.Portal>
  );
}

const StyledItem = styled(DropdownMenuPrimitive.Item, {
  all: 'unset',
  fontSize: 10,
  lineHeight: 1,
  color: '$grayA12',
  borderRadius: 0,
  display: 'flex',
  alignItems: 'center',
  padding: '$2 $2',
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

export const Dropdown = (props) => {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        {props.children}
      </DropdownMenuPrimitive.Trigger>

      <Content sideOffset={5}>
        <StyledItem>New Tab</StyledItem>
      </Content>
    </DropdownMenuPrimitive.Root>
  );
};
