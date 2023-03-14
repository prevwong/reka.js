import { CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as React from 'react';

type SelectItem = {
  value: string;
  title: string;
};

type SelectProps = {
  items: SelectItem[];
  onChange: (value: string) => void;
  value?: string;
  placeholder?: string;
};

export const Select = (props: SelectProps) => {
  return (
    <SelectPrimitive.Root
      value={props.value || undefined}
      onValueChange={(value) => props.onChange(value)}
    >
      <SelectPrimitive.SelectTrigger className="inline-flex items-center rounded-md px-3 py-1.5 text-xs gap-2 text-gray-600 border border-solid border-outline pointer shadow-sm hover:bg-gray-100">
        <SelectPrimitive.Value
          placeholder={props.placeholder || 'Select a value'}
        />
        <SelectPrimitive.SelectIcon>
          <ChevronDownIcon width={12} height={12} />
        </SelectPrimitive.SelectIcon>
      </SelectPrimitive.SelectTrigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="overflow-hidden bg-white rounded-md shadow-xl z-50">
          <SelectPrimitive.Viewport className="p-1.5">
            {props.items.map((item) => (
              <SelectPrimitive.Item
                className="cursor-pointer text-xs text-gray-900 rounded-md relative select-none flex items-center pt-1 pr-4 pb-1 pl-8 data-[highlighted]:bg-primary data-[highlighted]:text-white group"
                key={item.value}
                value={item.value}
              >
                <SelectPrimitive.ItemText>
                  {item.title}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute left-3 items-center justify-center inline-flex">
                  <span className="animate-pulse w-2.5 h-2.5 rounded-full bg-primary group-hover:bg-white" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};
