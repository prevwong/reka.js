import { ChevronDownIcon } from '@radix-ui/react-icons';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as React from 'react';

import { cn } from '@app/utils';

type SelectItem = {
  value: string;
  title: string | React.ReactElement;
};

type SelectProps = {
  className?: string;
  items: SelectItem[];
  onChange: (value: string) => void;
  value?: string;
  placeholder?: string;
  hideArrow?: boolean;
};

export const Select = (props: SelectProps) => {
  return (
    <SelectPrimitive.Root
      value={props.value || undefined}
      onValueChange={(value) => props.onChange(value)}
    >
      <SelectPrimitive.SelectTrigger
        className={cn(
          'inline-flex text-left overflow-hidden text-ellipsis whitespace-nowrap items-center rounded-md px-3 py-1.5 text-xs gap-2 text-gray-600 border border-solid border-outline pointer shadow-sm hover:bg-gray-100',
          props.className
        )}
      >
        <SelectPrimitive.Value
          placeholder={props.placeholder || 'Select a value'}
        />
        {!props.hideArrow && (
          <SelectPrimitive.SelectIcon>
            <ChevronDownIcon width={12} height={12} />
          </SelectPrimitive.SelectIcon>
        )}
      </SelectPrimitive.SelectTrigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="overflow-hidden bg-white rounded-md shadow-lg border border-solid border-outline z-50">
          <SelectPrimitive.Viewport className="p-1.5">
            {props.items.map((item) => (
              <SelectPrimitive.Item
                className="cursor-pointer text-xs text-gray-900 rounded-md relative select-none flex items-center pt-1 pr-4 pb-1 pl-7 data-[highlighted]:bg-primary-100 data-[highlighted]:text-primary group"
                key={item.value}
                value={item.value}
              >
                <SelectPrimitive.ItemText>
                  {item.title}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute left-3 items-center justify-center inline-flex">
                  <span className="w-2 h-2 rounded-full bg-primary group-hover:bg-primary" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};
