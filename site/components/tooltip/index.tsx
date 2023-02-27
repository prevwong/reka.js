import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';

import { styled, keyframes } from '@app/styles';

const slideUpAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const slideRightAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(-2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
});

const slideDownAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(-2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const slideLeftAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
});

const StyledContent = styled(TooltipPrimitive.Content, {
  borderRadius: 4,
  padding: '5px 8px',
  fontSize: 10,
  lineHeight: 1,
  color: '#fff',
  backgroundColor: '$gray12',
  position: 'relative',
  boxShadow:
    'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  '@media (prefers-reduced-motion: no-preference)': {
    animationDuration: '400ms',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    animationFillMode: 'forwards',
    willChange: 'transform, opacity',
    '&[data-state="delayed-open"]': {
      '&[data-side="top"]': { animationName: slideDownAndFade },
      '&[data-side="right"]': { animationName: slideLeftAndFade },
      '&[data-side="bottom"]': { animationName: slideUpAndFade },
      '&[data-side="left"]': { animationName: slideRightAndFade },
    },
  },
});

type TooltipProps = {
  content: string;
  children: React.ReactNode;
};

export const Tooltip = ({ children, content }: TooltipProps) => {
  return (
    <TooltipPrimitive.Root
      delayDuration={100}
      open={content === '' ? false : undefined}
    >
      <TooltipPrimitive.Trigger asChild>
        <span>{children}</span>
      </TooltipPrimitive.Trigger>
      <StyledContent sideOffset={5}>{content}</StyledContent>
    </TooltipPrimitive.Root>
  );
};
