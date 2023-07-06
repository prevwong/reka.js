import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as React from 'react';

import { cn } from '@app/utils';

type DropdownItem = {
  title: string | React.ReactElement;
  onSelect: () => void;
};

type DropdownProps = {
  title?: string;
  items: DropdownItem[];
  children: React.ReactNode;
  className?: string;
  onChange?: (open: boolean) => void;
  side?: DropdownMenuPrimitive.DropdownMenuContentProps['side'];
};

export const Dropdown = React.forwardRef<HTMLButtonElement, DropdownProps>(
  (props, ref) => {
    return (
      <DropdownMenuPrimitive.Root onOpenChange={props.onChange}>
        <DropdownMenuPrimitive.Trigger asChild ref={ref}>
          {props.children}
        </DropdownMenuPrimitive.Trigger>
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            side={props.side}
            className={cn(
              'animate-in data-[side=right]:slide-in-from-left-2 data-[side=left]:slide-in-from-right-2 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-100 bg-white p-1 text-slate-700 shadow-lg border border-solid border-outline',
              props.className
            )}
          >
            {props.title && (
              <div className="px-2 py-1.5">
                <h4 className="text-[0.7rem] font-medium text-slate-800">
                  {props.title}
                </h4>
              </div>
            )}

            {props.items.map((item, i) => (
              <DropdownMenuPrimitive.DropdownMenuItem
                className={cn(
                  `
                  relative flex items-center rounded-md py-1.5 px-2
                  cursor-pointer outline-none text-xs
                  focus:bg-primary-100 focus:text-primary text-left
                  data-[disabled]:pointer-events-none data-[disabled]:opacity-50
                  `
                )}
                key={i}
                onSelect={() => {
                  Promise.resolve().then(() => {
                    item.onSelect();
                  });
                }}
              >
                <span className="text-left">{item.title}</span>
              </DropdownMenuPrimitive.DropdownMenuItem>
            ))}
            {/* <StyledArrow /> */}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    );
  }
);
