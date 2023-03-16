import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';

type TooltipProps = {
  content: string;
  children: React.ReactNode;
};

export const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(
  ({ children, content }, ref) => {
    return (
      <TooltipPrimitive.Root open={content === '' ? false : undefined}>
        <TooltipPrimitive.Trigger asChild>
          <span ref={ref}>{children}</span>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className="rounded-md px-2 py-1 text-xs text-white bg-black shadow-lg z-[49] animate-in fade-in-50 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 "
            sideOffset={6}
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    );
  }
);
