import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as React from 'react';

import { cn } from '@app/utils';

type DropdownItem = {
  title: string;
  onSelect: () => void;
};

type DropdownProps = {
  items: DropdownItem[];
  children: React.ReactNode;
  className?: string;
};

export const Dropdown = React.forwardRef<HTMLButtonElement, DropdownProps>(
  (props, ref) => {
    return (
      <DropdownMenuPrimitive.Root>
        <DropdownMenuPrimitive.Trigger asChild ref={ref}>
          {props.children}
        </DropdownMenuPrimitive.Trigger>
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            className={cn(
              'animate-in data-[side=right]:slide-in-from-left-2 data-[side=left]:slide-in-from-right-2 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-100 bg-white p-1 text-slate-700 shadow-md',
              props.className
            )}
          >
            {props.items.map((item) => (
              <DropdownMenuPrimitive.DropdownMenuItem
                className={cn(
                  `
                  relative flex items-center rounded-md py-2 px-2
                  cursor-pointer outline-none text-xs
                  focus:bg-primary/90  focus:text-white
                  data-[disabled]:pointer-events-none data-[disabled]:opacity-50
                  `
                )}
                key={item.title}
                onSelect={() => {
                  Promise.resolve().then(() => {
                    item.onSelect();
                  });
                }}
              >
                {item.title}
              </DropdownMenuPrimitive.DropdownMenuItem>
            ))}
            {/* <StyledArrow /> */}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    );
  }
);
