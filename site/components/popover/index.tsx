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
        className="rounded-md p-4 w-64 bg-white/90 backdrop-blur-sm shadow-xl z-50 animation-fade"
        sideOffset={5}
      >
        {props.children}
        <PopoverPrimitive.Close
          className="font-inherit h-4 w-4 inline-flex items-center justify-center text-neutral-400 absolute top-3 right-3 hover:text-neutral-900"
          aria-label="Close"
        >
          <Cross2Icon width={15} height={15} />
        </PopoverPrimitive.Close>
        <PopoverPrimitive.Arrow className="fill-white" />
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  </PopoverPrimitive.Root>
);
