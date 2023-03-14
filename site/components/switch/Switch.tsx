import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as React from 'react';

import { cn } from '@app/utils';

type SwitchProps = {
  className?: string;
  checked: boolean;
  onChange: () => void;
};

export const Switch = (props: SwitchProps) => {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'w-10 h-4 rounded-full relative bg-gray-400 cursor-pointer data-[state="checked"]:bg-primary'
      )}
      checked={props.checked}
      onCheckedChange={() => props.onChange()}
    >
      <SwitchPrimitive.Thumb className='w-3 h-3 block rounded-full translate-x-2 transition-transform bg-white data-[state="checked"]:translate-x-5 data-[state="checked"]:bg-white' />
    </SwitchPrimitive.Root>
  );
};
