import { Cross2Icon } from '@radix-ui/react-icons';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import React from 'react';

type PopoverProps = {
  trigger: React.ReactNode;
  children?: React.ReactNode;
};

export const Popover = (props: PopoverProps) => (
  <PopoverPrimitive.Root>
    <PopoverPrimitive.Trigger asChild>{props.trigger}</PopoverPrimitive.Trigger>
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        className="rounded-md p-4 w-64 bg-white/90 border border-solid border-outline backdrop-blur-sm shadow-2xl z-50 animation-fade"
        sideOffset={3}
      >
        {props.children}
        <PopoverPrimitive.Close
          className="font-inherit h-4 w-4 inline-flex items-center justify-center text-slate-400 absolute top-3 right-3 hover:text-slate-800"
          aria-label="Close"
        >
          <Cross2Icon width={15} height={15} />
        </PopoverPrimitive.Close>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  </PopoverPrimitive.Root>
);
