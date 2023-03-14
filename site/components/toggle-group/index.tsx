import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';

import { cn } from '@app/utils';

export const ToggleGroup = (
  props: React.ComponentProps<typeof ToggleGroupPrimitive.Root>
) => {
  return (
    <ToggleGroupPrimitive.Root
      {...props}
      className={cn(
        'inline-flex border border-solid border-outline rounded-md shadow-sm py-2 px-2',
        props.className
      )}
    />
  );
};

export const ToggleGroupItem = (
  props: React.ComponentProps<typeof ToggleGroupPrimitive.ToggleGroupItem>
) => {
  return (
    <ToggleGroupPrimitive.ToggleGroupItem
      {...props}
      className={cn(
        'flex items-center justify-center rounded-md py-3 px-4 outline-none cursor-pointer text-xs text-gray-900 hover:bg-primary/10 hover:text-primary data-[state="on"]:bg-primary data-[state="on"]:text-white mx-1 first:ml-0 last:mr-0',
        props.className
      )}
    />
  );
};
